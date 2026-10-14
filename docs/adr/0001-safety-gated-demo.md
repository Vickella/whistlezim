# ADR 0001: Fail-closed demo and envelope encryption

Status: accepted for pre-release. The application starts in demo mode with intake off. Production intake requires every independent boolean gate plus keys, current migration and database configuration. Case content receives per-value DEKs wrapped by an external environment KEK. Attachments stay disabled. This avoids silently trading safety for zero-cost hosting while keeping the stack portable.
