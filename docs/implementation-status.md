# Implementation status

## M0 — architecture and governance

Implemented: architecture, threat model, data model migration, initial role matrix, privacy/legal mapping, deployment decision, runbooks and risk register. Pending: verified provider DPA/terms assessment, counsel findings, data-flow review and owner licence preference.

## M1 — foundation

Implemented: Next.js strict TypeScript, accessible responsive UI, hosted passwordless Auth, AAL2 fail-closed gate, organisations/members/categories schema, RLS, CI and demo gating. Pending: operator provisioning console and deployed Supabase integration evidence.

## M2 — reporter flow

Implemented in code: four-step validated flow, atomic database RPC, AES-GCM envelope encryption, independent case reference and 256-bit recovery secret, HMAC verifier, short-lived token, privacy-minimised quota, generic recovery failure, HttpOnly session and exit. Anonymous is default; no identity/contact is required, anonymous-mode contact is discarded, and no analytics/browser draft exists. Pending: isolated-database and full browser evidence; intake therefore remains off.

## M3 — officer portal

Implemented: MFA and RLS gates, grant-scoped queue/detail, encrypted content rendering, team/settings/audit/retention views. Pending: genuine mutation workflows for messages, notes, assignments, conflict dual control, status and close/reopen. These are not marked complete.

## M4/M5

Implemented: public policy baseline, retention records, runbooks, headers, CSP, redaction helper, CI/CodeQL/Dependabot and core tests. Pending: exports, automated retention, cryptographic audit-chain writer/verifier, real backup drill, accessibility/manual tests, dependency/secret scan review, penetration review and production rehearsal.

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
