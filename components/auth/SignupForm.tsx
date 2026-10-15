"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { FormEvent, useMemo, useState } from "react";
import { PasswordInput } from "./PasswordInput";
import { signupFailure, signupMessages } from "@/lib/auth/signup-error";

export function SignupForm({ url, keyValue, initialSent = false, initialStatus = "" }: { url?: string; keyValue?: string; initialSent?: boolean; initialStatus?: string }) {
  const client = useMemo(() => url && keyValue ? createBrowserClient(url, keyValue) : null, [url, keyValue]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(initialSent);
  const [status, setStatus] = useState(initialStatus);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim().toLowerCase();
    const password = String(values.get("password") ?? "");
    const confirmation = String(values.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setStatus("The passwords do not match.");
      return;
    }
    if (!client) {
      setStatus("Account creation is temporarily unavailable.");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard/mfa` }
      });
      if (error) {
        setStatus(signupMessages[signupFailure(error)]);
        return;
      }
      if (data.session) {
        window.location.assign("/dashboard/mfa");
        return;
      }
      setSent(true);
      setStatus("Check your email and open the verification link to continue.");
    } catch {
      setStatus("The signup service could not be reached. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) return <div className="signup-confirmation" role="status">
    <h2>Verify your email</h2>
    <p>{status}</p>
    <p>You will then set up multi factor authentication and create your organisation workspace.</p>
  </div>;

  return <form className="auth-form" method="post" action="/auth/signup" onSubmit={submit}>
    <div className="field">
      <label htmlFor="signup-email">Work email</label>
      <input id="signup-email" name="email" type="email" autoComplete="email" maxLength={320} required />
    </div>
    <PasswordInput id="signup-password" name="password" label="Create password" autoComplete="new-password" minLength={12} maxLength={128} help="Use at least 12 characters and avoid a password used elsewhere." />
    <PasswordInput id="signup-password-confirmation" name="passwordConfirmation" label="Confirm password" autoComplete="new-password" minLength={12} maxLength={128} />
    <label className="consent-row">
      <input name="terms" type="checkbox" required />
      <span>I agree to the <Link href="/terms">Terms of Service</Link>, acknowledge the <Link href="/privacy">Privacy Notice</Link> and confirm I am authorised to create this organisation workspace.</span>
    </label>
    <button className="button full-button" disabled={busy} type="submit">{busy ? "Creating account…" : "Create secure account"}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
