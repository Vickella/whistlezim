import { NextRequest, NextResponse } from "next/server";
import { authClient } from "@/lib/auth/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
  try {
    const client = await authClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login?error=expired_link", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=unavailable", request.url));
  }
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
