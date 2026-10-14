# Operations

Allowed telemetry: aggregate request/error/latency counts, database reachability, quota bands, backup age, key-version age, aggregate failed auth, intake gate and migration version. Never record request bodies, report text, recovery values, auth headers or raw address data. Retain logs briefly under an approved schedule.

At 70% capacity warn operators; at 85% prepare intake closure; at 95% automatically close new intake while preserving follow-up where safe. `/status` exposes only coarse health. Maintenance and incident banners must not reveal tenant activity.
