# Deployment and rollback

1. Obtain written hosting-terms approval; do not assume Vercel Hobby permits the intended operation.
2. Create separate Supabase projects for preview and production. Apply reviewed migrations and verify their exact version.
3. Generate independent 32-byte KEK, recovery pepper and audit integrity keys. Store server-side; arrange separate approved escrow.
4. Configure exact Auth redirect URLs and all `.env.example` variables. Evidence references must identify approved records; never fabricate them. Preview uses synthetic data only.
5. Run lint, typecheck, unit/integration/security/E2E checks and `next build` from the lockfile.
6. Inspect CSP, no-store responses, logs, MFA, RLS negatives, quotas and coarse health output in staging.
7. Bootstrap the first `platform_operators` row directly through a reviewed database administration session. Require two distinct active operators to approve an organisation verification. Platform operators cannot read cases through application RLS.
8. Perform the encrypted backup and isolated restore drill, then record the manifest hash and measured results in the evidence system.
9. Leave intake false until every release checklist item is signed. Attachments remain off.

## Supabase authentication setup

1. In Authentication, open Sign In / Providers, then Email. Enable the email provider, allow new users to sign up and require email confirmation. Keep anonymous sign ins disabled.
2. In Authentication, open URL Configuration. Set the Site URL to `https://whistlezim.vercel.app`. Add `https://whistlezim.vercel.app/auth/callback` to Redirect URLs. Add the local callback only for local development.
3. In Authentication, open Emails and configure a custom SMTP provider with a domain controlled by the operator. The Supabase default mail service is not suitable for public production signup or team invitations.
4. In Authentication, open Multi Factor and keep TOTP enabled. The application requires assurance level 2 before workspace creation or officer access.
5. Review Authentication Rate Limits after SMTP is connected. Keep confirmation, recovery and sign in limits conservative and monitor aggregate failures without recording addresses in application logs.
6. Apply every SQL file in `supabase/migrations` in filename order. Migration `202610150003_self_service_organization.sql` enables secure self service organisation creation.
7. Redeploy and test with a synthetic owner: create account, confirm email, enrol an authenticator, create the workspace and invite a synthetic officer.

Self registered organisations start with public intake paused and a pending identity and authority verification. Do not bypass verification or release gates for convenience.

Rollback by selecting the last verified immutable deployment. Database rollback requires a reviewed forward-fix migration; never destructively reverse a live schema. If confidentiality may be affected, disable intake, preserve evidence and invoke the incident runbook.
