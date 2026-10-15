import { redirect } from "next/navigation";
import { OrganizationSetupForm } from "@/components/auth/OrganizationSetupForm";
import { authClient } from "@/lib/auth/server";

export default async function Page() {
  const db = await authClient();
  const [{ data: auth }, { data: assurance }] = await Promise.all([
    db.auth.getUser(),
    db.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  if (!auth.user) redirect("/login");
  if (assurance?.currentLevel !== "aal2") redirect("/dashboard/mfa");
  const { data: member } = await db.from("organization_members").select("organization_id").eq("user_id", auth.user.id).eq("active", true).limit(1).maybeSingle();
  if (member) redirect("/dashboard");

  return <section className="onboarding-page prose">
    <p className="eyebrow dark">Final setup step</p>
    <h1>Create your organisation workspace</h1>
    <p>Your account is verified and protected. Add the organisation details used by your case team and reporting channel.</p>
    <OrganizationSetupForm />
  </section>;
}
