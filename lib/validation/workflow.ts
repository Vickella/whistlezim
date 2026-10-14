import { z } from "zod";
const content = z.string().trim().min(1).max(50_000);
const reason = z.string().trim().min(2).max(80).regex(/^[a-z0-9_ ]+$/i);
export const caseActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send_message"), content }), z.object({ action: z.literal("add_note"), content }),
  z.object({ action: z.literal("change_status"), value: z.enum(["acknowledged", "triage", "investigating", "awaiting_reporter"]) }),
  z.object({ action: z.literal("change_priority"), value: z.enum(["low", "normal", "high", "urgent"]) }),
  z.object({ action: z.literal("assign"), value: z.string().uuid() }), z.object({ action: z.literal("request_restriction"), value: reason }),
  z.object({ action: z.literal("approve_restriction"), value: z.string().uuid() }), z.object({ action: z.literal("set_hold"), value: reason }),
  z.object({ action: z.literal("release_hold") }), z.object({ action: z.literal("resolve"), value: reason, content }),
  z.object({ action: z.literal("close"), value: reason }), z.object({ action: z.literal("reopen"), value: reason }), z.object({ action: z.literal("archive"), value: reason }), z.object({ action: z.literal("declare_conflict"), value: reason })
]);
