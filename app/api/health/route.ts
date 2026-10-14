import { NextResponse } from "next/server"; import { getConfig,intakeGate } from "@/lib/config";
export const dynamic="force-dynamic";
export async function GET(){const c=getConfig();const gate=intakeGate(c);return NextResponse.json({status:"operational",mode:c.APP_MODE,intake:gate.enabled?"open":"closed",attachments:"disabled",migration:c.DATABASE_MIGRATION_CURRENT?"current":"unverified"},{headers:{"cache-control":"no-store"}})}
