# Backup and restore

Supabase Free does not provide the managed backup assurance required here. Before real intake, an accountable operator must test an encrypted off-platform backup covering PostgreSQL, private evidence objects (if ever enabled), configuration inventory and separately escrowed keys.

Run `scripts/backup.ps1` only from a controlled host to an approved encrypted destination. Restore into an isolated network with `scripts/restore.ps1`, verify integrity, record measured RPO/RTO and securely dispose of the drill copy. Never place decrypted dumps, passwords or keys in CI, Git, Vercel artifacts or public storage. Backup expiry must reflect case deletion and lawful holds. No RPO/RTO is promised until a measured drill is recorded.
