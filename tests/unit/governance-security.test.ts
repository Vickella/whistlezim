import { describe, expect, it } from "vitest";
import { auditMac, AuditRecord, verifyAuditChain } from "@/lib/security/audit";
import { decryptExport, encryptExport } from "@/lib/security/export";
import { createReporterSession, verifyReporterSession } from "@/lib/security/reporter-session";
const key = Buffer.alloc(32, 3).toString("base64");
describe("governance security", () => {
  it("detects audit chain modification", () => { const first: AuditRecord = { id: crypto.randomUUID(), organization_id: crypto.randomUUID(), actor_pseudonym: "actor", action: "note", target_kind: "case", target_id: crypto.randomUUID(), success: true, safe_metadata: {}, created_at: "2026-10-14T10:00:00Z", previous_mac: null }; first.integrity_mac = auditMac(first, key); const second: AuditRecord = { ...first, id: crypto.randomUUID(), action: "status", created_at: "2026-10-14T10:01:00+00:00", previous_mac: first.integrity_mac, integrity_mac: undefined }; second.integrity_mac = auditMac(second, key); expect(verifyAuditChain([first, second], key)).toBe(true); expect(verifyAuditChain([first, { ...second, action: "export" }], key)).toBe(false); });
  it("encrypts and authenticates exports", async () => { const encrypted = await encryptExport({ report: "secret" }, "a sufficiently long password"); expect(encrypted.ciphertext).not.toContain("secret"); expect(await decryptExport(encrypted, "a sufficiently long password")).toEqual({ report: "secret" }); await expect(decryptExport(encrypted, "a different long password")).rejects.toThrow(); });
  it("signs expiring reporter sessions", () => { const token = createReporterSession("case-id", key, Date.now() + 1000); expect(verifyReporterSession(token, key)?.caseId).toBe("case-id"); expect(verifyReporterSession(`${token}x`, key)).toBeNull(); expect(verifyReporterSession(createReporterSession("case-id", key, Date.now() - 1), key)).toBeNull(); });
});
