"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ChannelAccess() {
  const router = useRouter();
  const [error, setError] = useState("");

  function openChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const entry = String(new FormData(event.currentTarget).get("channel") ?? "").trim();
    let slug = entry.toLowerCase();
    try {
      if (/^https?:\/\//i.test(entry)) {
        const url = new URL(entry);
        const parts = url.pathname.split("/").filter(Boolean);
        slug = parts[0] === "o" ? parts[1] ?? "" : "";
      }
    } catch { slug = ""; }
    if (!/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(slug)) {
      setError("Enter the organisation channel code or reporting page address supplied to you.");
      return;
    }
    router.push(`/o/${encodeURIComponent(slug)}`);
  }

  return <form className="channel-form" onSubmit={openChannel}>
    <div className="channel-field">
      <label htmlFor="channel">Organisation channel</label>
      <input id="channel" name="channel" autoComplete="off" placeholder="Enter channel code or reporting page address" required />
    </div>
    <button type="submit">Continue</button>
    {error && <p className="error channel-error" role="alert">{error}</p>}
  </form>;
}
