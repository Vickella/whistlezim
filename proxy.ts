import { NextRequest, NextResponse } from "next/server";

function providerOrigin() { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin; } catch { return ""; } }
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const connect = providerOrigin();
  const dev = process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : "";
  const csp = [`default-src 'self'`, `script-src 'nonce-${nonce}' 'strict-dynamic'${dev}`, `style-src 'self' 'nonce-${nonce}'`, `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src 'self'${connect ? ` ${connect} ${connect.replace("https:", "wss:")}` : ""}`, `object-src 'none'`, `base-uri 'none'`, `form-action 'self'`, `frame-ancestors 'none'`, `worker-src 'self' blob:`, ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : [])].join("; ");
  const requestHeaders = new Headers(request.headers); requestHeaders.set("x-nonce", nonce); requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/track") || /\/o\/[^/]+\/report/.test(request.nextUrl.pathname)) { response.headers.set("Cache-Control", "private, no-store, max-age=0"); response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive"); }
  return response;
}

export const config = { matcher: [{ source: "/((?!_next/static|_next/image|favicon.ico).*)", missing: [{ type: "header", key: "next-router-prefetch" }, { type: "header", key: "purpose", value: "prefetch" }] }] };
