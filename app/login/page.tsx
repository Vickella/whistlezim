import { AuthForm } from "@/components/auth/AuthForm";
import { getConfig } from "@/lib/config";

export default function Page() {
  const config = getConfig();
  return <div className="auth-page">
    <section className="auth-panel" aria-labelledby="login-title">
      <p className="eyebrow dark">Officer access</p>
      <h1 id="login-title">Welcome back</h1>
      <p className="auth-lead">Sign in to review assigned reports, communicate with reporters and manage case activity.</p>
      <AuthForm url={config.NEXT_PUBLIC_SUPABASE_URL} keyValue={config.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
      <p className="auth-help">Access is limited to authorised organisation officers. Multi factor authentication is required before case information can be viewed.</p>
    </section>
    <aside className="auth-aside">
      <span className="auth-lock" aria-hidden="true">◇</span>
      <h2>Protected case access</h2>
      <p>Officer sessions use organisation membership, multi factor authentication and explicit case permissions.</p>
    </aside>
  </div>;
}
