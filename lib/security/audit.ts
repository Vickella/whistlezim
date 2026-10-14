import { createHmac, timingSafeEqual } from "node:crypto";

export type AuditRecord = {
  id: string; organization_id: string | null; actor_pseudonym: string | null; action: string;
  target_kind: string; target_id: string | null; success: boolean; safe_metadata: unknown;
  created_at: string; previous_mac: string | null; integrity_mac?: string;
};

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`;
}

export function auditMac(record: AuditRecord, encodedKey: string) {
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("Audit integrity key must be 32 bytes encoded as base64");
  return createHmac("sha256", key).update(stable({ ...record, created_at: new Date(record.created_at).toISOString(), integrity_mac: undefined })).digest("base64url");
}

export function verifyAuditChain(records: AuditRecord[], encodedKey: string) {
  let previous: string | null = null;
  for (const record of records) {
    if ((record.previous_mac ?? null) !== previous || !record.integrity_mac) return false;
    const expected = auditMac(record, encodedKey);
    const actualBytes = Buffer.from(record.integrity_mac); const expectedBytes = Buffer.from(expected);
    if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return false;
    previous = record.integrity_mac;
  }
  return true;
}
