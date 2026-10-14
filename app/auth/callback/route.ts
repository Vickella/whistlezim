import { NextRequest,NextResponse } from "next/server"; import { authClient } from "@/lib/auth/server";
export async function GET(req:NextRequest){const code=req.nextUrl.searchParams.get("code");if(code){const db=await authClient();await db.auth.exchangeCodeForSession(code)}return NextResponse.redirect(new URL("/dashboard",req.url))}
