import { z } from "zod";

const bool = z.enum(["true", "false"]).default("false").transform((v) => v === "true");
const schema = z.object({
  APP_MODE: z.enum(["demo", "production"]).default("demo"),
  INTAKE_ENABLED: bool,
  LEGAL_APPROVED: bool,
  SECURITY_APPROVED: bool,
  BACKUP_VERIFIED: bool,
  HOSTING_APPROVED: bool,
  DATABASE_MIGRATION_CURRENT: bool,
  CASE_ENCRYPTION_KEK: z.string().optional(),
  CASE_SECRET_PEPPER: z.string().optional(),
  AUDIT_INTEGRITY_KEY: z.string().optional(),
  LEGAL_APPROVAL_REFERENCE: z.string().min(8).optional(),
  SECURITY_REVIEW_REFERENCE: z.string().min(8).optional(),
  BACKUP_RESTORE_EVIDENCE_SHA256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
  HOSTING_APPROVAL_REFERENCE: z.string().min(8).optional(),
  OWNER_LAUNCH_APPROVAL_REFERENCE: z.string().min(8).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SECURITY_CONTACT_EMAIL: z.string().email().default("security@example.invalid"),
  PRIVACY_CONTACT_EMAIL: z.string().email().default("privacy@example.invalid")
});

export type AppConfig = z.infer<typeof schema>;
export function getConfig(source: Record<string, string | undefined> = process.env): AppConfig { return schema.parse(source); }
export function intakeGate(c: AppConfig) {
  const contactsAreMonitored = !c.SECURITY_CONTACT_EMAIL.endsWith(".invalid") && !c.PRIVACY_CONTACT_EMAIL.endsWith(".invalid");
  const checks = {
    productionMode: c.APP_MODE === "production",
    ownerEnabled: c.INTAKE_ENABLED,
    legalApproved: c.LEGAL_APPROVED,
    securityApproved: c.SECURITY_APPROVED,
    backupVerified: c.BACKUP_VERIFIED,
    hostingApproved: c.HOSTING_APPROVED,
    migrationCurrent: c.DATABASE_MIGRATION_CURRENT,
    encryptionConfigured: Boolean(c.CASE_ENCRYPTION_KEK && c.CASE_SECRET_PEPPER),
    auditIntegrityConfigured: Boolean(c.AUDIT_INTEGRITY_KEY),
    databaseConfigured: Boolean(c.NEXT_PUBLIC_SUPABASE_URL && c.SUPABASE_SERVICE_ROLE_KEY),
    legalEvidenceRecorded: Boolean(c.LEGAL_APPROVAL_REFERENCE),
    securityEvidenceRecorded: Boolean(c.SECURITY_REVIEW_REFERENCE),
    restoreEvidenceRecorded: Boolean(c.BACKUP_RESTORE_EVIDENCE_SHA256),
    hostingEvidenceRecorded: Boolean(c.HOSTING_APPROVAL_REFERENCE),
    ownerApprovalRecorded: Boolean(c.OWNER_LAUNCH_APPROVAL_REFERENCE),
    monitoredContactsConfigured: contactsAreMonitored
  };
  return { enabled: Object.values(checks).every(Boolean), checks };
}
