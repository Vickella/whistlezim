import { notFound } from "next/navigation";
import { CaseActions } from "@/components/cases/CaseActions";
import { requireOfficer } from "@/lib/auth/require-officer";
import { decryptText, EncryptedValue } from "@/lib/security/crypto";
import { getConfig } from "@/lib/config";
import { recordCaseRead } from "@/lib/audit/case";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { db, user } = await requireOfficer();
  const { data } = await db.from("cases").select("organization_id,public_reference,status,priority,encrypted_title,encrypted_body,case_messages(sender_kind,encrypted_body,created_at),case_notes(encrypted_body,created_at),case_restriction_requests(id,reason_code,approved_at,created_at)").eq("id", id).maybeSingle();
  const key = getConfig().CASE_ENCRYPTION_KEK; if (!data || !key) notFound();
  await recordCaseRead(id, data.organization_id, user.id);
  const pending = data.case_restriction_requests.filter((request) => !request.approved_at);
  return <section><div className="prose"><h1>{decryptText(data.encrypted_title as EncryptedValue, key)}</h1><p>{data.public_reference} | {data.status} | {data.priority}</p><article className="card"><h2>Original report</h2><p className="prewrap">{decryptText(data.encrypted_body as EncryptedValue, key)}</p></article>{pending.length > 0 && <div className="notice"><h2>Pending restriction requests</h2>{pending.map((request) => <p key={request.id}><code>{request.id}</code> | {request.reason_code}</p>)}</div>}<h2>Messages</h2>{data.case_messages.map((message) => <article className="card" key={message.created_at}><strong>{message.sender_kind}</strong><p className="prewrap">{decryptText(message.encrypted_body as EncryptedValue, key)}</p></article>)}<h2>Officer only notes</h2>{data.case_notes.map((note) => <article className="card" key={note.created_at}><p className="prewrap">{decryptText(note.encrypted_body as EncryptedValue, key)}</p></article>)}</div><CaseActions caseId={id}/></section>;
}
