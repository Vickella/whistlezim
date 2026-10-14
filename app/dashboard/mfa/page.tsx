import { redirect } from "next/navigation";
import { MfaFlow } from "@/components/auth/MfaFlow";
import { authClient } from "@/lib/auth/server";
import { getConfig } from "@/lib/config";

export default async function Page() {
  const db = await authClient();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/login");
  const config = getConfig();
  return <section className="prose"><h1>MFA is required</h1><p>Use a TOTP authenticator. Case data stays inaccessible until this session reaches assurance level 2.</p><MfaFlow url={config.NEXT_PUBLIC_SUPABASE_URL} keyValue={config.NEXT_PUBLIC_SUPABASE_ANON_KEY}/></section>;
}
