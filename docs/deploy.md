# Deployment and rollback

1. Obtain written hosting-terms approval; do not assume Vercel Hobby permits the intended operation.
2. Create separate Supabase projects for preview and production. Apply reviewed migrations and verify their exact version.
3. Generate independent 32-byte KEK, recovery pepper and audit integrity keys. Store server-side; arrange separate approved escrow.
4. Configure exact Auth redirect URLs and all `.env.example` variables. Preview uses synthetic data only.
5. Run lint, typecheck, unit/integration/security/E2E checks and `next build` from the lockfile.
6. Inspect CSP, no-store responses, logs, MFA, RLS negatives, quotas and coarse health output in staging.
7. Leave intake false until every release-checklist item is signed. Attachments remain off.

Rollback by selecting the last verified immutable deployment. Database rollback requires a reviewed forward-fix migration; never destructively reverse a live schema. If confidentiality may be affected, disable intake, preserve evidence and invoke the incident runbook.
