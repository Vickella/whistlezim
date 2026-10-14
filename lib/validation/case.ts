import { z } from "zod";
export const reportSchema = z.object({
  slug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/),
  categoryId: z.string().uuid(),
  title: z.string().trim().min(5).max(160),
  narrative: z.string().trim().min(40).max(20_000),
  incidentAt: z.iso.datetime().optional().or(z.literal("")),
  location: z.string().trim().max(200).optional(),
  people: z.string().trim().max(1000).optional(),
  contact: z.string().trim().max(320).optional(),
  confidentiality: z.enum(["anonymous", "confidential"]),
  confirmation: z.literal(true)
}).superRefine((v, ctx) => { if (v.confidentiality === "confidential" && !v.contact) ctx.addIssue({ code: "custom", path: ["contact"], message: "A contact method is required for confidential identified reporting" }); });
export const trackSchema = z.object({ reference: z.string().regex(/^WZ-\d{4}-[A-F0-9]{24}$/), secret: z.string().min(32).max(100) });
