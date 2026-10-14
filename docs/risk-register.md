# Risk and blocker register

| Risk/blocker | Severity | Treatment/status |
|---|---:|---|
| Legal/controller/transfer decisions not reviewed | Critical | blocks intake; counsel required |
| Hosting terms classification unresolved | Critical | blocks intake |
| No evidenced encrypted backup/restore/key escrow | Critical | blocks intake |
| Security/RLS/E2E review not run against deployed Supabase | Critical | blocks intake |
| Monitored contacts not provided | High | `.invalid` defaults; blocks intake |
| Licence preference/compatibility not approved | High | no licence yet; blocks public open-source release claim |
| Live MFA and role workflow evidence absent | High | implementation fails closed; run against isolated Supabase and retain results |
| Audit and retention integration evidence absent | High | transactional implementation present; live negative and tamper tests still block intake |
| Backup restore drill not executed | Critical | authenticated tooling present; isolated measured drill and separate key escrow still block intake |
| Evidence malware scanning unavailable at $0 | High | attachments disabled |
