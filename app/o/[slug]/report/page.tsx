import { notFound } from "next/navigation";
import { adminDb } from "@/lib/db/admin";
import { intakeGate,getConfig } from "@/lib/config";
import { ReportForm } from "@/components/reporting/ReportForm";

export const dynamic="force-dynamic";

export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!intakeGate(getConfig()).enabled)return <div className="entry-page"><section className="entry-panel"><p className="eyebrow dark">Organisation reporting channel</p><h1>Reporting is temporarily unavailable</h1><p>This channel cannot accept a new report right now. Please use another reporting route provided by the organisation or return later.</p></section></div>;let org;try{const {data}=await adminDb().from("organizations").select("id,name,verified_at,intake_enabled,case_categories(id,label)").eq("slug",slug).is("deleted_at",null).eq("case_categories.enabled",true).maybeSingle();org=data}catch{notFound()}if(!org||!org.verified_at||!org.intake_enabled)notFound();return <div className="wrap section"><p className="eyebrow dark">Confidential reporting</p><h1>Report to {org.name}</h1><ReportForm slug={slug} categories={(org.case_categories||[]) as {id:string;label:string}[]}/></div>}
