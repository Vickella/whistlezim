"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 63);
}

export function OrganizationSetupForm({ initialName = "" }: { initialName?: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(slugify(initialName));
  const [slugEdited, setSlugEdited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const response = await fetch("/api/org/self-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug })
    }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) as { error?: string } : {};
    if (!response?.ok) {
      setStatus(result.error ?? "The workspace could not be created. Try again.");
      setBusy(false);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return <form className="setup-form card" onSubmit={submit}>
    <div className="field">
      <label htmlFor="organisation-name">Organisation name</label>
      <input id="organisation-name" name="name" minLength={2} maxLength={160} value={name} onChange={(event) => {
        const nextName = event.target.value;
        setName(nextName);
        if (!slugEdited) setSlug(slugify(nextName));
      }} required />
    </div>
    <div className="field">
      <label htmlFor="organisation-slug">Reporting address</label>
      <div className="address-input"><span aria-hidden="true">/o/</span><input id="organisation-slug" name="slug" minLength={3} maxLength={63} pattern="[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?" value={slug} onChange={(event) => { setSlugEdited(true); setSlug(slugify(event.target.value)); }} required /></div>
      <p className="field-help">Choose a short address your reporters will recognise. You cannot change it during initial setup.</p>
    </div>
    <div className="setup-note"><strong>Safe by default</strong><span>Your workspace opens immediately, while public report intake remains paused until channel checks are complete.</span></div>
    <button className="button full-button" type="submit" disabled={busy}>{busy ? "Creating workspace…" : "Create organisation workspace"}</button>
    {status && <p className="form-status error" role="status">{status}</p>}
  </form>;
}
