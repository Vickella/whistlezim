const sensitive = new Set(["secret", "recoverySecret", "password", "token", "body", "narrative", "message", "authorization"]);
export function safeLog(input: Record<string, unknown>) { return Object.fromEntries(Object.entries(input).filter(([k]) => !sensitive.has(k))); }
