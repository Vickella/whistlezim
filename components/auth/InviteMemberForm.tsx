"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const roles = [
  ["case_officer", "Case officer"],
  ["case_manager", "Case manager"],
  ["independent_reviewer", "Independent reviewer"],
  ["auditor_readonly", "Auditor"]
] as const;

export function InviteMemberForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setError(false);
    const form = event.currentTarget;
    const values = new FormData(form);
    const response = await fetch("/api/org/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.get("email"), role: values.get("role") })
    });
    const result = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(true);
      setStatus(result.error ?? "The invitation could not be sent.");
      return;
    }
    form.reset();
    setStatus("Officer created. A secure invitation has been sent to their work email.");
    router.refresh();
  }

  return <form className="card member-form" onSubmit={submit}>
    <div className="member-form-heading"><div><p className="eyebrow dark">Team administration</p><h2>Add an officer</h2></div><p>The officer will receive a secure email invitation.</p></div>
    <div className="member-form-fields">
      <div className="field"><label htmlFor="member-email">Work email</label><input id="member-email" name="email" type="email" autoComplete="off" required /></div>
      <div className="field"><label htmlFor="member-role">Role</label><select id="member-role" name="role" defaultValue="case_officer">{roles.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      <button disabled={busy} type="submit">{busy ? "Creating officer…" : "Create officer"}</button>
    </div>
    {status&&<p className={error?"error":"form-status"} role={error?"alert":"status"}>{status}</p>}
  </form>;
}
