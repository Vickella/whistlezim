import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/db/admin";
import { intakeGate, getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Page({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  let org:{name:string;sector:string|null;verified_at:string|null;intake_enabled:boolean}|null=null;
  try {
    const {data}=await adminDb().from("organizations").select("name,sector,verified_at,intake_enabled").eq("slug",slug).is("deleted_at",null).maybeSingle();
    org=data;
  } catch { org=null; }
  if(!org) notFound();
  const open=Boolean(intakeGate(getConfig()).enabled&&org.intake_enabled&&org.verified_at);
  return <div className="entry-page"><section className="entry-panel">
    <p className="eyebrow dark">Organisation reporting channel</p>
    <h1>{org.name}</h1>
    {org.sector&&<p>{org.sector}</p>}
    {open ? <><p>Use this channel to submit a new concern. You may report anonymously where your organisation permits it.</p><div className="actions"><Link className="button" href={`/o/${slug}/report`}>Start a report</Link><Link className="button quiet" href="/track">Track an existing report</Link></div></> : <div className="notice"><strong>Reporting is temporarily unavailable.</strong> Please use another reporting route provided by the organisation or return later.</div>}
  </section></div>;
}
