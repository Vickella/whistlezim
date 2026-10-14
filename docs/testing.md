# Testing evidence

Automated unit coverage includes envelope encryption/tamper detection, secret verification, state transitions, retention bounds, role/grant policy, launch gating, validation and redaction. Playwright covers the demo banner, disabled intake and keyboard-accessible tracking form. CI runs lint, typecheck, unit tests and production build; CodeQL and Dependabot are configured.

Before production, run PostgreSQL integration tests against an isolated local Supabase stack for atomic submission, RLS tenant negatives, revoked grants, reporter isolation, locks, retention/holds and audit integrity. Complete manual WCAG 2.2 AA keyboard/screen-reader review, dependency audit, secret scan, penetration review and full synthetic submit→track→officer→close E2E. These are release blockers until evidenced.
