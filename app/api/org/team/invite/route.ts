import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/auth/server";
import { getConfig } from "@/lib/config";
import { adminDb } from "@/lib/db/admin";
import { hasValidOrigin } from "@/lib/security/csrf";

const inviteSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  role: z.enum(["case_manager", "case_officer", "independent_reviewer", "auditor_readonly"])
});

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Request denied." }, { status: 403 });

  const sessionClient = await authClient();
  const [{ data: auth }, { data: assurance }] = await Promise.all([
    sessionClient.auth.getUser(),
    sessionClient.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  if (!auth.user || assurance?.currentLevel !== "aal2") {
    return NextResponse.json({ error: "Multi factor authentication is required." }, { status: 403 });
  }

  const { data: membership } = await sessionClient
    .from("organization_members")
    .select("organization_id,role,active")
    .eq("user_id", auth.user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (!membership || membership.role !== "org_owner") {
    return NextResponse.json({ error: "Only an organisation owner can invite officers." }, { status: 403 });
  }

  const input = inviteSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Enter a valid work email and role." }, { status: 400 });
  if (input.data.email === auth.user.email?.toLowerCase()) {
    return NextResponse.json({ error: "This account is already on the team." }, { status: 409 });
  }

  const config = getConfig();
  if (!config.CASE_SECRET_PEPPER) return NextResponse.json({ error: "Invitations are temporarily unavailable." }, { status: 503 });
  const admin = adminDb();
  const rateKey = createHmac("sha256", Buffer.from(config.CASE_SECRET_PEPPER, "base64"))
    .update(`team-invite\0${auth.user.id}`)
    .digest("base64url");
  const { data: allowed } = await admin.rpc("consume_submission_limit", { p_rate_key: rateKey, p_scope: "team-invite", p_limit: 20 });
  if (!allowed) return NextResponse.json({ error: "Invitation limit reached. Try again later." }, { status: 429 });

  const redirectTo = new URL("/auth/callback", request.url).toString();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(input.data.email, { redirectTo });
  if (inviteError || !invited.user) {
    return NextResponse.json({ error: "The invitation could not be created. The address may already have an account." }, { status: 409 });
  }

  const { error: membershipError } = await admin.from("organization_members").insert({
    organization_id: membership.organization_id,
    user_id: invited.user.id,
    role: input.data.role,
    active: true,
    invited_by: auth.user.id
  });
  if (membershipError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return NextResponse.json({ error: "The invitation could not be completed." }, { status: 503 });
  }

  return NextResponse.json({ member: { id: invited.user.id, email: input.data.email, role: input.data.role } }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
