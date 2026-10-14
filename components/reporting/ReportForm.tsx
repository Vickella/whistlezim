"use client";

import { FormEvent, useState } from "react";
type Category = { id: string; label: string };

export function ReportForm({ slug, categories }: { slug: string; categories: Category[] }) {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({ confidentiality: "anonymous" });
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ reference: string; secret: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { slug, categoryId: values.categoryId, title: values.title, narrative: values.narrative, incidentAt: values.incidentAt ? new Date(values.incidentAt).toISOString() : "", location: values.location || "", people: values.people || "", contact: values.contact || "", confidentiality: values.confidentiality, confirmation: true };
    try {
      const tokenResponse = await fetch("/api/public/submission-token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) });
      if (!tokenResponse.ok) throw new Error("This channel cannot accept a report right now.");
      const { token } = await tokenResponse.json();
      const response = await fetch("/api/public/reports", { method: "POST", headers: { "content-type": "application/json", "x-submission-token": token }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We could not submit the report.");
      setResult(data);
    } catch (err) { setError(err instanceof Error ? err.message : "We could not submit the report."); } finally { setBusy(false); }
  }
  const capture = (e: React.FormEvent<HTMLFormElement>) => { const t = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement; if (t.name) setValues((v) => ({ ...v, [t.name]: t.value })); };
  if (result) return <div className="card" role="status"><h2>Report received</h2><p>Save both values now. The recovery secret will not be shown again and cannot be recovered.</p><p><strong>Case reference</strong></p><p className="secret">{result.reference}</p><p><strong>Recovery secret</strong></p><p className="secret">{result.secret}</p><p>Store these separately in a safe place. Do not email the secret or include it in a URL.</p></div>;

  return <form onSubmit={submit} onChange={capture}>
    <p><strong>Step {step} of 4</strong></p>{error && <p className="error" role="alert">{error}</p>}
    {step === 1 && <section><h2>Before you report</h2><div className="notice"><strong>Not an emergency service.</strong> If someone is in immediate danger, contact an appropriate local emergency authority.</div><p>You do not need an account, name, email, phone or location. Your device, network and what you write may still identify you.</p><fieldset><legend>How should this report be handled?</legend><label className="inline"><input required type="radio" name="confidentiality" value="anonymous" defaultChecked /> Anonymous — do not provide a contact method</label><label className="inline"><input required type="radio" name="confidentiality" value="confidential" /> Confidential identified — provide a contact method below</label></fieldset></section>}
    {step === 2 && <section><h2>Describe the concern</h2><div className="field"><label htmlFor="categoryId">Category</label><select required name="categoryId" id="categoryId" defaultValue=""><option value="" disabled>Select a category</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.label}</option>)}</select></div><div className="field"><label htmlFor="title">Short title</label><input required minLength={5} maxLength={160} name="title" id="title" defaultValue={values.title} /></div><div className="field"><label htmlFor="narrative">What happened?</label><textarea required minLength={40} maxLength={20000} name="narrative" id="narrative" defaultValue={values.narrative} /><small>Include only information needed to understand the concern.</small></div></section>}
    {step === 3 && <section><h2>Optional details</h2><div className="field"><label htmlFor="incidentAt">Incident date and time</label><input type="datetime-local" name="incidentAt" id="incidentAt" defaultValue={values.incidentAt} /></div><div className="field"><label htmlFor="location">Location</label><input maxLength={200} name="location" id="location" defaultValue={values.location} /></div><div className="field"><label htmlFor="people">People involved</label><textarea maxLength={1000} name="people" id="people" defaultValue={values.people} /></div><div className="field"><label htmlFor="contact">Contact method (only for confidential identified reports)</label><input maxLength={320} name="contact" id="contact" autoComplete="off" defaultValue={values.contact} /></div><div className="notice"><strong>Evidence upload is disabled.</strong> Safe malware scanning and verified encrypted backup are not yet available.</div></section>}
    {step === 4 && <section><h2>Confirm and submit</h2><p>Review the previous steps. Once accepted, you will receive a reference and a separate recovery secret that is shown once.</p><label className="inline"><input required name="confirmation" type="checkbox" /> I understand the anonymity limitations and confirm this report is made in good faith.</label></section>}
    <div className="actions">{step > 1 && <button type="button" onClick={() => setStep((s) => s - 1)}>Back</button>}{step < 4 ? <button type="button" onClick={() => setStep((s) => s + 1)}>Continue</button> : <button disabled={busy} type="submit">{busy ? "Submitting…" : "Submit report"}</button>}</div>
  </form>;
}
