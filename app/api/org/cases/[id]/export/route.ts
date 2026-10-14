import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/auth/server";
import { adminDb } from "@/lib/db/admin";
import { getConfig } from "@/lib/config";
import { auditMac, AuditRecord } from "@/lib/security/audit";
import { decryptText, EncryptedValue, pseudonymize } from "@/lib/security/crypto";
import { hasValidOrigin } from "@/lib/security/csrf";
import { encryptExport } from "@/lib/security/export";

const schema = z.object({ password: z.string().min(16).max(256), confirmation: z.literal("EXPORT") });
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Request denied" }, { status: 403 });
  const { id } = await context.params; const client = await authClient();
  const [{ data: userData }, { data: assurance }] = await Promise.all([client.auth.getUser(), client.auth.mfa.getAuthenticatorAssuranceLevel()]);
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  if (assurance?.currentLevel !== "aal2") return NextResponse.json({ error: "MFA required" }, { status: 403 });
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "A strong password and EXPORT confirmation are required" }, { status: 400 });
  const config = getConfig();
  if (!config.CASE_ENCRYPTION_KEK || !config.AUDIT_INTEGRITY_KEY) return NextResponse.json({ error: "Export unavailable" }, { status: 503 });
  const { data } = await client.from("cases").select("id,organization_id,public_reference,status,priority,submitted_at,encrypted_title,encrypted_body,case_messages(sender_kind,encrypted_body,created_at),case_notes(encrypted_body,created_at)").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Case unavailable" }, { status: 404 });
  const archive = { format: "whistlezim-case-v1", exportedAt: new Date().toISOString(), case: { reference: data.public_reference, status: data.status, priority: data.priority, submittedAt: data.submitted_at, title: decryptText(data.encrypted_title as EncryptedValue, config.CASE_ENCRYPTION_KEK), report: decryptText(data.encrypted_body as EncryptedValue, config.CASE_ENCRYPTION_KEK), messages: data.case_messages.map((message) => ({ sender: message.sender_kind, createdAt: message.created_at, body: decryptText(message.encrypted_body as EncryptedValue, config.CASE_ENCRYPTION_KEK!) })), notes: data.case_notes.map((note) => ({ createdAt: note.created_at, body: decryptText(note.encrypted_body as EncryptedValue, config.CASE_ENCRYPTION_KEK!) })) } };
  const encrypted = await encryptExport(archive, input.data.password); const admin = adminDb();
  const { data: latest } = await admin.from("audit_events").select("integrity_mac").eq("organization_id", data.organization_id).order("chain_sequence", { ascending: false }).limit(1).maybeSingle();
  const createdAt = new Date().toISOString(); const auditId = randomUUID(); const previous = latest?.integrity_mac ?? null;
  const actor = pseudonymize(userData.user.id, `audit:${data.organization_id}`, config.AUDIT_INTEGRITY_KEY);
  const record: AuditRecord = { id: auditId, organization_id: data.organization_id, actor_pseudonym: actor, action: "export", target_kind: "case", target_id: id, success: true, safe_metadata: {}, created_at: createdAt, previous_mac: previous };
  const { error } = await admin.rpc("officer_case_action", { p_case_id: id, p_actor_id: userData.user.id, p_action: "export", p_encrypted_body: null, p_value: null, p_safe_metadata: {}, p_audit_id: auditId, p_audit_created_at: createdAt, p_actor_pseudonym: actor, p_previous_mac: previous, p_integrity_mac: auditMac(record, config.AUDIT_INTEGRITY_KEY) });
  if (error) return NextResponse.json({ error: "Export authorization failed" }, { status: 403 });
  return new NextResponse(JSON.stringify(encrypted), { headers: { "Content-Type": "application/vnd.whistlezim.encrypted+json", "Content-Disposition": `attachment; filename="${data.public_reference}.wzexport"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
