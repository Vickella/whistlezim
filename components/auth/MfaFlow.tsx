"use client";

import { createBrowserClient } from "@supabase/ssr";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Factor = { id: string };

export function MfaFlow({ url, keyValue }: { url?: string; keyValue?: string }) {
  const router = useRouter();
  const client = useMemo(() => url && keyValue ? createBrowserClient(url, keyValue) : null, [url, keyValue]);
  const [factor, setFactor] = useState<Factor | null>(null);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("Checking your authentication level…");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function prepare() {
      if (!client) { setStatus("Authentication has not been configured."); return; }
      const assurance = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      if (assurance.data?.currentLevel === "aal2") { router.replace("/dashboard"); router.refresh(); return; }
      const listed = await client.auth.mfa.listFactors();
      if (listed.error) { setStatus("Unable to load MFA. Sign in again and retry."); return; }
      const verified = listed.data.totp.find((item) => item.status === "verified");
      if (verified) { setFactor(verified); setStatus("Enter the six digit code from your authenticator app."); return; }
      for (const pending of listed.data.totp.filter((item) => item.status !== "verified")) await client.auth.mfa.unenroll({ factorId: pending.id });
      const enrolled = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "WhistleZim officer access" });
      if (enrolled.error) { setStatus("Unable to begin MFA enrolment. Sign in again and retry."); return; }
      setFactor(enrolled.data);
      setQr(enrolled.data.totp.qr_code);
      setSecret(enrolled.data.totp.secret);
      setStatus("Scan the code, then enter the current six digit code.");
    }
    void prepare();
    return () => { active = false; };
  }, [client, router]);

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!client || !factor || !/^\d{6}$/.test(code)) { setStatus("Enter a valid six digit code."); return; }
    setBusy(true);
    const challenge = await client.auth.mfa.challenge({ factorId: factor.id });
    if (challenge.error) { setStatus("The MFA challenge could not be created."); setBusy(false); return; }
    const result = await client.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.data.id, code });
    setBusy(false);
    if (result.error) { setStatus("That code was not accepted. Wait for a new code and retry."); return; }
    setStatus("MFA verified. Opening the case workspace…");
    router.replace("/dashboard");
    router.refresh();
  }

  return <div className="card mfa-card">
    {qr && <div className="mfa-setup"><img className="mfa-qr" src={qr} alt="Authenticator enrolment QR code"/><p>Manual setup key</p><code className="secret">{secret}</code></div>}
    <form onSubmit={verify}>
      <div className="field"><label htmlFor="mfa-code">Authenticator code</label><input id="mfa-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required/></div>
      <button disabled={busy || !factor}>{busy ? "Verifying…" : "Verify MFA"}</button>
      <p role="status" aria-live="polite">{status}</p>
    </form>
  </div>;
}
