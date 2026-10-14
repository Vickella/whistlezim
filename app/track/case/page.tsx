import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReporterReply } from "@/components/reporting/ReporterReply";
import { adminDb } from "@/lib/db/admin";
import { getConfig } from "@/lib/config";
import { decryptText, EncryptedValue } from "@/lib/security/crypto";
import { verifyReporterSession } from "@/lib/security/reporter-session";
import { CaseStatus, reporterFacingStatus } from "@/lib/domain/cases";
export const dynamic = "force-dynamic";
export default async function Page() { const config = getConfig(); const token = (await cookies()).get("wz_reporter_session")?.value; if (!token || !config.CASE_SECRET_PEPPER) redirect("/track"); const session = verifyReporterSession(token, config.CASE_SECRET_PEPPER); if (!session) redirect("/track"); const { data } = await adminDb().from("cases").select("public_reference,status,encrypted_title,case_messages(sender_kind,encrypted_body,created_at)").eq("id", session.caseId).is("deleted_at", null).single(); if (!data || !config.CASE_ENCRYPTION_KEK) redirect("/track"); return <div className="wrap section prose"><h1>{decryptText(data.encrypted_title as EncryptedValue, config.CASE_ENCRYPTION_KEK)}</h1><p><strong>{data.public_reference}</strong> · Status: {reporterFacingStatus(data.status as CaseStatus)}</p><h2>Conversation</h2>{(data.case_messages || []).map((message: { sender_kind: string; encrypted_body: EncryptedValue; created_at: string }, index: number) => <article className="card" key={index}><p><strong>{message.sender_kind === "reporter" ? "You" : "Case team"}</strong> · {new Date(message.created_at).toLocaleDateString()}</p><p className="prewrap">{decryptText(message.encrypted_body, config.CASE_ENCRYPTION_KEK!)}</p></article>)}<ReporterReply/><form method="post" action="/api/public/exit"><button className="button danger">Exit and clear session</button></form><p className="muted">Exit clears this application session, but cannot erase browser, device, or network traces.</p></div>; }
