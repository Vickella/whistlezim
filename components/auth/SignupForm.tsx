"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { FormEvent, useMemo, useState } from "react";

export function SignupForm({ url, keyValue }: { url?: string; keyValue?: string }) {
  const client = useMemo(() => url && keyValue ? createBrowserClient(url, keyValue) : null, [url, keyValue]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    if (!client) {
      setStatus("Account creation is temporarily unavailable.");
      return;
    }

    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim().toLowerCase();
    const password = String(values.get("password") ?? "");
    const confirmation = String(values.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setStatus("The passwords do not match.");
      return;
    }

    setBusy(true);
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard/mfa` }
    });
    setBusy(false);
    if (error) {
      setStatus(error.message.toLowerCase().includes("password")
        ? "Use a stronger password with at least 12 characters."
        : "The account could not be created. Check your details and try again.");
      return;
    }
    if (data.session) {
      window.location.assign("/dashboard/mfa");
      return;
    }
    setSent(true);
    setStatus("Check your email and open the verification link to continue.");
  }

  if (sent) return <div className="signup-confirmation" role="status">
    <h2>Verify your email</h2>
    <p>{status}</p>
    <p>You will then set up multi factor authentication and create your organisation workspace.</p>
  </div>;

  return <form className="auth-form" onSubmit={submit}>
    <div className="field">
      <label htmlFor="signup-email">Work email</label>
      <input id="signup-email" name="email" type="email" autoComplete="email" maxLength={320} required />
    </div>
    <div className="field">
      <label htmlFor="signup-password">Create password</label>
      <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
      <p className="field-help">Use at least 12 characters and avoid a password used elsewhere.</p>
    </div>
    <div className="field">
      <label htmlFor="signup-password-confirmation">Confirm password</label>
      <input id="signup-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
    </div>
    <label className="consent-row">
      <input name="terms" type="checkbox" required />
      <span>I agree to the <Link href="/terms">terms</Link> and confirm I am authorised to create this organisation workspace.</span>
    </label>
    <button className="button full-button" disabled={busy} type="submit">{busy ? "Creating account…" : "Create secure account"}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
