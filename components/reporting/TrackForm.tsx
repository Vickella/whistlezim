"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function TrackForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    const response = await fetch("/api/public/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reference: fd.get("reference"), secret: fd.get("secret") }) });
    if (response.ok) router.push("/track/case");
    else { setError("Those details could not be verified. Check both values and try again later."); setBusy(false); }
  }
  return <form onSubmit={submit}>{error && <p className="error" role="alert">{error}</p>}<div className="field"><label htmlFor="reference">Case reference</label><input id="reference" name="reference" autoComplete="off" required placeholder="WZ-2026-…" /></div><div className="field"><label htmlFor="secret">Recovery secret</label><input id="secret" name="secret" type="password" autoComplete="off" required /></div><button disabled={busy}>{busy ? "Checking…" : "Open case"}</button></form>;
}
