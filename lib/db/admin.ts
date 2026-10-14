import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";
export function adminDb() { const c = getConfig(); if (!c.NEXT_PUBLIC_SUPABASE_URL || !c.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Database is not configured"); return createClient(c.NEXT_PUBLIC_SUPABASE_URL, c.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }); }
