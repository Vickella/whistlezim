import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/auth/server";
import { hasValidOrigin } from "@/lib/security/csrf";

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/)
});

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) return NextResponse.json({ error: "Request denied." }, { status: 403 });
  const db = await authClient();
  const [{ data: auth }, { data: assurance }] = await Promise.all([
    db.auth.getUser(),
    db.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  if (!auth.user || assurance?.currentLevel !== "aal2") {
    return NextResponse.json({ error: "Verified multi factor authentication is required." }, { status: 403 });
  }
  const input = organizationSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Enter a valid organisation name and reporting address." }, { status: 400 });

  const { data, error } = await db.rpc("self_register_organization", {
    p_name: input.data.name,
    p_slug: input.data.slug
  });
  if (error || !data) {
    return NextResponse.json({ error: "That reporting address is unavailable or this account already has a workspace." }, { status: 409 });
  }
  return NextResponse.json({ organizationId: data }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
