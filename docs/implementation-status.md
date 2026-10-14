# Implementation status

## M0 — architecture and governance

Implemented: architecture, threat model, data model migration, initial role matrix, privacy/legal mapping, deployment decision, runbooks and risk register. Pending: verified provider DPA/terms assessment, counsel findings, data-flow review and owner licence preference.

## M1 — foundation

Implemented: Next.js strict TypeScript, accessible responsive UI, hosted passwordless Auth, TOTP enrolment and challenge, database enforced AAL2 access, organisations/members/categories schema, dual operator organisation verification, RLS, CI and demo gating. Pending: deployed Supabase integration evidence and operator interface polish.

## M2 — reporter flow

Implemented in code: four-step validated flow, atomic database RPC, AES-GCM envelope encryption, independent case reference and 256-bit recovery secret, HMAC verifier, short-lived token, privacy-minimised quota, generic recovery failure, HttpOnly session and exit. Anonymous is default; no identity/contact is required, anonymous-mode contact is discarded, and no analytics/browser draft exists. Pending: isolated-database and full browser evidence; intake therefore remains off.

## M3 — officer portal

Implemented: MFA and RLS gates, grant scoped queue and detail, encrypted content rendering, officer and reporter messages, private notes, controlled transitions, resolution, close and reopen, assignment, conflict self removal, two person restriction approval, legal holds, audit and retention views. Case mutations and their audit entries commit in one database transaction. Pending: live multi role integration evidence.

## M4/M5

Implemented: version marked legal drafts, evidence register, retention jobs and legal holds, authenticated operator deletion with content free tombstones, password encrypted case export, cryptographic audit chain writing and verification, authenticated encrypted backup tooling, runbooks, headers, CSP, redaction helper, CI, CodeQL, Dependabot, and core tests. Pending: counsel approval, a real isolated restore drill, live database integration, accessibility manual review, secret scan review, independent penetration review, and production rehearsal.

## M6

Blocked by every unchecked item in `release-checklist.md`. `APP_MODE=demo`, `INTAKE_ENABLED=false`, and attachments off are the only approved state.

## Verification record — 2026-10-14

- ESLint: passed with zero warnings.
- TypeScript strict check: passed.
- Unit/security tests: 16/16 passed; 100% statements/branches/functions/lines across configured domain, validation, tenancy and security modules.
- Next.js 16.4.0 production build: passed.
- Production dependency audit: zero known vulnerabilities.
- Runtime smoke: homepage and tracking returned 200; demo health reported intake closed.
- Runtime headers: nonce CSP, no-referrer, nosniff, frame denial, permissions policy, cross-origin isolation headers and HSTS present; sensitive tracking route was `private, no-store` and `noindex`.
- Not run: live Supabase integration, browser E2E, independent penetration test, legal/provider review and backup restore drill. These remain release blockers.
