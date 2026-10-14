# Threat model

| Threat | Primary controls | Residual risk |
|---|---|---|
| Cross-tenant/IDOR | per-case grants, RLS, server context | service-role or database compromise |
| Reference guessing | 96-bit random public component plus 256-bit secret, generic errors, privacy-preserving quotas and lockout | stolen secret |
| Reporter identification | no account/contact by default, no analytics/storage, no raw address persistence, no-referrer | device, network/provider logs and narrative clues |
| Officer compromise | hosted auth, AAL2 MFA, grants, revocation, audit | authorised plaintext access |
| Insider suppression | append-oriented events, independent reviewer design | integrity-key/admin compromise |
| XSS/injection | React escaping, Zod, parameterised API, CSP | dependency/browser defect |
| Resource exhaustion | bounded bodies, short-lived tokens, atomic rotating-HMAC quotas | distributed abuse/provider exhaustion |
| Malicious evidence | attachments disabled | evidence sent outside the platform |
| Key compromise | envelope encryption, versions, documented rotation | environment/operator has KEK |
| Provider outage | portable stack, backup plan, intake gate | free-tier pause/no SLA |

Independent review and attack-path testing remain mandatory before production.
