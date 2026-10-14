import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth/server";
import { adminDb } from "@/lib/db/admin";
import { getConfig } from "@/lib/config";
import { auditMac, AuditRecord } from "@/lib/security/audit";
import { encryptText, pseudonymize } from "@/lib/security/crypto";
import { caseActionSchema } from "@/lib/validation/workflow";
import { hasValidOrigin } from "@/lib/security/csrf";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!hasValidOrigin(request) || Number(request.headers.get("content-length") ?? 0) > 60_000) return NextResponse.json({ error: "Request denied" }, { status: 403 });
  const { id } = await context.params; const client = await authClient();
  const [{ data: userData }, { data: assurance }] = await Promise.all([client.auth.getUser(), client.auth.mfa.getAuthenticatorAssuranceLevel()]);
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (assurance?.currentLevel !== "aal2") return NextResponse.json({ error: "MFA verification required" }, { status: 403 });
  const parsed = caseActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid case action" }, { status: 400 });
  const config = getConfig();
  if (!config.CASE_ENCRYPTION_KEK || !config.AUDIT_INTEGRITY_KEY) return NextResponse.json({ error: "Secure case operations are unavailable" }, { status: 503 });
  const { data: caseRow } = await client.from("cases").select("organization_id").eq("id", id).maybeSingle();
  if (!caseRow) return NextResponse.json({ error: "Case unavailable" }, { status: 404 });
  const item = parsed.data; const encrypted = "content" in item ? encryptText(item.content, config.CASE_ENCRYPTION_KEK) : null; const value = "value" in item ? item.value : null;
  const safeMetadata = item.action === "change_status" ? { status: value } : item.action === "change_priority" ? { priority: value } : ["set_hold", "request_restriction", "resolve", "close", "reopen", "archive", "declare_conflict"].includes(item.action) ? { reasonCode: value } : {};
  const admin = adminDb();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: latest } = await admin.from("audit_events").select("integrity_mac").eq("organization_id", caseRow.organization_id).order("chain_sequence", { ascending: false }).limit(1).maybeSingle();
    const createdAt = new Date().toISOString(); const auditId = randomUUID(); const previous = latest?.integrity_mac ?? null;
    const actor = pseudonymize(userData.user.id, `audit:${caseRow.organization_id}`, config.AUDIT_INTEGRITY_KEY);
    const record: AuditRecord = { id: auditId, organization_id: caseRow.organization_id, actor_pseudonym: actor, action: item.action, target_kind: "case", target_id: id, success: true, safe_metadata: safeMetadata, created_at: createdAt, previous_mac: previous };
    const integrity = auditMac(record, config.AUDIT_INTEGRITY_KEY);
    const { data, error } = await admin.rpc("officer_case_action", { p_case_id: id, p_actor_id: userData.user.id, p_action: item.action, p_encrypted_body: encrypted, p_value: value, p_safe_metadata: safeMetadata, p_audit_id: auditId, p_audit_created_at: createdAt, p_actor_pseudonym: actor, p_previous_mac: previous, p_integrity_mac: integrity });
    if (!error) return NextResponse.json({ ok: true, id: data }, { headers: { "Cache-Control": "no-store" } });
    if (!error.message.includes("audit chain changed") || attempt === 1) return NextResponse.json({ error: "The action was not applied" }, { status: 403 });
  }
  return NextResponse.json({ error: "The action was not applied" }, { status: 409 });
}
