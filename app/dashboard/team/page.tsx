import { requireOfficer } from "@/lib/auth/require-officer";
import { getConfig } from "@/lib/config";
import { pseudonymize } from "@/lib/security/crypto";

export default async function Page() {
  const { db, member } = await requireOfficer();
  const { data } = await db.from("organization_members").select("user_id,role,active,joined_at").eq("organization_id", member.organization_id);
  const key = getConfig().AUDIT_INTEGRITY_KEY;
  return <section><h1>Team</h1><p>Members are shown by a pseudonym created for this purpose, not by authentication identifier. Invitations and sensitive role changes require reauthentication and reviewed provisioning.</p><table><thead><tr><th>Member</th><th>Role</th><th>Active</th></tr></thead><tbody>{(data || []).map((m) => <tr key={m.user_id}><td>{key ? `${pseudonymize(m.user_id, "team-display", key).slice(0, 12)}…` : "Identity hidden"}</td><td>{m.role}</td><td>{m.active ? "Yes" : "No"}</td></tr>)}</tbody></table></section>;
}
