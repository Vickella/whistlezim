# Architecture

Browser → Next.js route handler → validation/origin check/launch gate → server-only Supabase client → PostgreSQL transaction. Anonymous clients never receive table credentials capable of selecting cases. Officer reads use hosted authentication, AAL2 MFA and RLS-enforced case grants.

Case content uses a fresh 256-bit data-encryption key per value with AES-256-GCM. The DEK is wrapped by an environment-held KEK. Ciphertext, nonces, tags and key version are stored; plaintext and the KEK are not. A server holding the KEK can decrypt, so this is encrypted at rest and in transit—not zero knowledge.

Anonymous reporting collects no required identity/contact field. Recovery uses independent random reference and secret values; only HMAC(reference + secret) is stored. Sensitive responses are `no-store`, referrers are suppressed, no analytics run, and no draft is placed in browser storage. Upstream infrastructure metadata remains a residual risk.

Where an operational link is necessary, direct identifiers are replaced with purpose-separated HMAC pseudonyms: audit actors and rotating abuse-control keys cannot be read back without separately held key material. Random UUIDs and opaque case references prevent meaningful identifiers appearing in routine workflow. Pseudonymisation reduces exposure but is not anonymisation; relinkable pseudonymous records remain protected personal data. Re-identification access must be separated, least-privileged and audited.
