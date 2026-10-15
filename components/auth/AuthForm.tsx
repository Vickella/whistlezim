"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { PasswordInput } from "./PasswordInput";

export function AuthForm({ url, keyValue }: { url?: string; keyValue?: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function client() {
    if (!url || !keyValue) {
      setStatus("Officer access is temporarily unavailable.");
      return null;
    }
    return createBrowserClient(url, keyValue);
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const supabase = client();
    if (!supabase) { setBusy(false); return; }
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("Email or password not recognised. Check your details or request a sign in link.");
      setBusy(false);
      return;
    }
    window.location.assign("/dashboard");
  }

  async function sendLink(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim();
    if (!email) { setStatus("Enter your work email first."); return; }
    const supabase = client();
    if (!supabase) return;
    setBusy(true);
    setStatus("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback`, shouldCreateUser: false } });
    setStatus(error ? "A sign in link could not be sent. Confirm that your officer account is active." : "A secure sign in link has been sent to your work email.");
    setBusy(false);
  }

  return <form className="auth-form" onSubmit={signIn}>
    <div className="field">
      <label htmlFor="email">Work email</label>
      <input required type="email" autoComplete="username" name="email" id="email" />
    </div>
    <PasswordInput id="password" name="password" label="Password" autoComplete="current-password" minLength={8} />
    <button className="button full-button" disabled={busy} type="submit">{busy ? "Signing in…" : "Sign in securely"}</button>
    <div className="auth-divider"><span>or</span></div>
    <button className="button quiet full-button" disabled={busy} type="button" onClick={sendLink}>Email me a secure sign in link</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
