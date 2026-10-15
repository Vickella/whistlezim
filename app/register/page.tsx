import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { getConfig } from "@/lib/config";

export default function Page() {
  const config = getConfig();
  return <div className="auth-page signup-page">
    <section className="auth-panel" aria-labelledby="signup-title">
      <p className="eyebrow dark">Organisation setup</p>
      <h1 id="signup-title">Create your workspace</h1>
      <p className="auth-lead">Start with your work email. Email verification and multi factor authentication protect the organisation workspace from the first sign in.</p>
      <SignupForm url={config.NEXT_PUBLIC_SUPABASE_URL} keyValue={config.NEXT_PUBLIC_SUPABASE_ANON_KEY} />
      <p className="auth-help">Already have access? <Link href="/login">Sign in to the officer portal</Link>.</p>
    </section>
    <aside className="auth-aside signup-aside" aria-label="Setup steps">
      <p className="eyebrow">Simple secure setup</p>
      <ol className="signup-steps">
        <li><span>1</span><div><strong>Create your account</strong><p>Use a work email and a strong password.</p></div></li>
        <li><span>2</span><div><strong>Verify and protect access</strong><p>Confirm your email and connect an authenticator app.</p></div></li>
        <li><span>3</span><div><strong>Open your workspace</strong><p>Name the organisation, complete channel setup and invite your case team.</p></div></li>
      </ol>
    </aside>
  </div>;
}
