# Backup and restore

Supabase Free does not provide the managed backup assurance required here. Before real intake, an accountable operator must test an encrypted off-platform backup covering PostgreSQL, private evidence objects (if ever enabled), configuration inventory and separately escrowed keys.

Run `scripts/backup.ps1` only from a controlled host to an approved destination outside the repository. It streams `pg_dump` directly through AES-256-GCM with a scrypt derived key, avoiding an intermediate plaintext dump, and writes a SHA-256 evidence manifest. Store `BACKUP_PASSPHRASE` separately from the artifact.

Restore into an isolated network with `scripts/restore.ps1`. The restore refuses to start unless `RESTORE_CONFIRM_ISOLATED=YES`, verifies the manifest before decryption, and fails closed on authentication errors. Record the artifact SHA-256, operator, start and finish times, measured recovery point and recovery time, row count checks, application smoke checks, and drill-copy disposal. Only then may that manifest hash be placed in `BACKUP_RESTORE_EVIDENCE_SHA256`.

Never place decrypted dumps, passwords, keys, manifests that reveal sensitive locations, or backup artifacts in CI, Git, Vercel artifacts, or public storage. The database backup does not include separately stored evidence objects or key escrow; those need independent approved procedures. Backup expiry must reflect case deletion and lawful holds. No recovery objective is promised until a measured drill is recorded.
