import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db/admin";
import { getConfig } from "@/lib/config";
import { trackSchema } from "@/lib/validation/case";
import { verifySecret } from "@/lib/security/crypto";
import { hasValidOrigin } from "@/lib/security/csrf";
import { createReporterSession } from "@/lib/security/reporter-session";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const generic = () => NextResponse.json({ error: "Unable to verify" }, { status: 401, headers: { "cache-control": "no-store" } });
const hmac = (key: string, purpose: string, value: string) => createHmac("sha256", Buffer.from(key, "base64")).update(`${purpose}\0${value}`).digest("base64url");

export async function POST(req: NextRequest) {
  const started = Date.now(); const c = getConfig();
  try {
    if (!hasValidOrigin(req) || !c.CASE_SECRET_PEPPER) throw new Error("denied");
    const parsed = trackSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new Error("denied");
    const db = adminDb();
    const forwarded = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    const rateKey = hmac(c.CASE_SECRET_PEPPER, "recovery-rate", `${day}\0${forwarded}`);
    const { data: allowed } = await db.rpc("consume_submission_limit", { p_rate_key: rateKey, p_scope: "case-recovery", p_limit: 30 });
    if (!allowed) throw new Error("denied");
    const { data } = await db.from("case_access_credentials").select("case_id,verifier_hmac,failed_attempt_count,lockout_until,cases!inner(public_reference,deleted_at)").eq("cases.public_reference", parsed.data.reference).maybeSingle();
    const locked = data?.lockout_until && new Date(data.lockout_until) > new Date();
    const valid = data && !locked && verifySecret(parsed.data.reference, parsed.data.secret, data.verifier_hmac, c.CASE_SECRET_PEPPER);
    if (!valid) { if (data) await db.rpc("record_failed_recovery", { p_case_id: data.case_id }); throw new Error("denied"); }
    await db.from("case_access_credentials").update({ failed_attempt_count: 0, lockout_until: null }).eq("case_id", data.case_id);
    const response = NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
    response.cookies.set("wz_reporter_session", createReporterSession(data.case_id, c.CASE_SECRET_PEPPER), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/track", maxAge: 1800 });
    return response;
  } catch { await pause(Math.max(0, 300 - (Date.now() - started))); return generic(); }
}
