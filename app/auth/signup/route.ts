import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authClient } from "@/lib/auth/server";
import { hasValidOrigin } from "@/lib/security/csrf";

const signupSchema = z.object({
  email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
  password: z.string().min(12).max(128),
  passwordConfirmation: z.string().min(12).max(128),
  terms: z.literal("on")
}).refine((value) => value.password === value.passwordConfirmation);

function registerRedirect(request: NextRequest, value: string) {
  const response = NextResponse.redirect(new URL(`/register?${value}`, request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  if (!hasValidOrigin(request)) return registerRedirect(request, "error=request_denied");
  const input = signupSchema.safeParse(Object.fromEntries(await request.formData().catch(() => new FormData())));
  if (!input.success) return registerRedirect(request, "error=invalid_details");

  try {
    const client = await authClient();
    const callback = new URL("/auth/callback?next=/dashboard/mfa", request.url).toString();
    const { data, error } = await client.auth.signUp({ email: input.data.email, password: input.data.password, options: { emailRedirectTo: callback } });
    if (error) return registerRedirect(request, error.message.toLowerCase().includes("password") ? "error=weak_password" : "error=signup_failed");
    if (data.session) return NextResponse.redirect(new URL("/dashboard/mfa", request.url), 303);
    return registerRedirect(request, "state=check_email");
  } catch {
    return registerRedirect(request, "error=unavailable");
  }
}
