# WhistleZim Free Edition

WhistleZim is a privacy-first, multi-organisation whistleblowing and case-management platform. This repository currently provides a deployable **safety-gated demo**: public trust pages, Supabase officer authentication with MFA enforcement, explicit case grants, encrypted report submission, anonymous recovery credentials, RLS migrations, officer views, CI and operational documentation.

## Safety status

Real-data intake is off by default and must remain off until every M6 launch gate is independently evidenced and approved. Attachments are disabled. The software reduces identifying-data collection but cannot guarantee absolute anonymity: devices, networks, hosting providers, report content and document metadata can identify people.

Anonymous reporting is the default. It requires no account or contact detail, discards any contact field accidentally supplied in anonymous mode, uses a non-enumerable reference plus a separate 256-bit recovery secret, stores only a keyed verifier, avoids browser storage and analytics, and stores only short-lived rotating HMACs—not raw addresses—for abuse control.

## Local verification

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to `.env.local` for local configuration. Keep `APP_MODE=demo` and `INTAKE_ENABLED=false` unless the signed release checklist is complete. Apply `supabase/migrations` to an isolated development project; never point tests or previews at live case data.

## Deployment

The app is portable Next.js/PostgreSQL software and can deploy to Vercel, but Vercel Hobby must not be assumed suitable for commercial operation. Supabase Free has availability and backup limitations. See `docs/deploy.md` and `docs/implementation-status.md`.

## Licensing

No open-source licence has yet been selected because the specification requires third-party compatibility and owner business-preference review first. Until a licence is added, copyright law reserves reuse rights. This is an explicit release blocker, not a claim that the current repository is already open source.
