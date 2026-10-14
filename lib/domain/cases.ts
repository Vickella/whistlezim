export const statuses = ["new", "acknowledged", "triage", "investigating", "awaiting_reporter", "resolved", "closed", "archived"] as const;
export type CaseStatus = typeof statuses[number];
const transitions: Record<CaseStatus, readonly CaseStatus[]> = { new: ["acknowledged", "triage"], acknowledged: ["triage"], triage: ["investigating", "awaiting_reporter", "closed"], investigating: ["awaiting_reporter", "resolved", "closed"], awaiting_reporter: ["investigating", "resolved", "closed"], resolved: ["closed", "investigating"], closed: ["investigating", "archived"], archived: [] };
export function canTransition(from: CaseStatus, to: CaseStatus) { return transitions[from].includes(to); }
export function retentionDue(submitted: Date, days: number) { if (!Number.isInteger(days) || days < 1 || days > 3650) throw new Error("Invalid retention period"); return new Date(submitted.getTime() + days * 86_400_000); }
