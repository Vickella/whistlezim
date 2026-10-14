import { notFound } from "next/navigation";
import { requireOfficer } from "@/lib/auth/require-officer";
import { decryptText, EncryptedValue } from "@/lib/security/crypto";
import { getConfig } from "@/lib/config";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { db } = await requireOfficer();
  const { data } = await db.from("cases").select("public_reference,status,priority,encrypted_title,encrypted_body,case_messages(sender_kind,encrypted_body,created_at),case_notes(encrypted_body,created_at)").eq("id", id).maybeSingle();
  const key = getConfig().CASE_ENCRYPTION_KEK; if (!data || !key) notFound();
  return <section className="prose"><h1>{decryptText(data.encrypted_title as EncryptedValue, key)}</h1><p>{data.public_reference} · {data.status} · {data.priority}</p><article className="card"><h2>Original report</h2><p className="prewrap">{decryptText(data.encrypted_body as EncryptedValue, key)}</p></article><h2>Messages</h2>{data.case_messages.map((m) => <article className="card" key={m.created_at}><strong>{m.sender_kind}</strong><p>{decryptText(m.encrypted_body as EncryptedValue, key)}</p></article>)}<h2>Officer-only notes</h2>{data.case_notes.map((n) => <article className="card" key={n.created_at}><p>{decryptText(n.encrypted_body as EncryptedValue, key)}</p></article>)}</section>;
}
