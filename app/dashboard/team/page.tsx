import { InviteMemberForm } from "@/components/auth/InviteMemberForm";
import { requireOfficer } from "@/lib/auth/require-officer";
import { getConfig } from "@/lib/config";
import { adminDb } from "@/lib/db/admin";
import { pseudonymize } from "@/lib/security/crypto";

const roleLabels: Record<string,string> = {
  org_owner: "Organisation owner",
  case_manager: "Case manager",
  case_officer: "Case officer",
  independent_reviewer: "Independent reviewer",
  auditor_readonly: "Auditor"
};

export default async function Page() {
  const { db, member } = await requireOfficer();
  const owner = member.role === "org_owner";
  const source = owner ? adminDb() : db;
  const { data } = await source.from("organization_members").select("user_id,role,active,joined_at").eq("organization_id", member.organization_id).order("joined_at",{ascending:true});
  const key = getConfig().AUDIT_INTEGRITY_KEY;
  const rows = await Promise.all((data||[]).map(async(item)=>{
    if(!owner) return {...item,email:null};
    const {data:user}=await adminDb().auth.admin.getUserById(item.user_id);
    return {...item,email:user.user?.email??null};
  }));

  return <section className="team-page">
    <div className="section-heading"><p className="eyebrow dark">Access management</p><h1>Team</h1><p>Manage the officers who can access your organisation workspace. Case information remains limited by separate case permissions.</p></div>
    {owner&&<InviteMemberForm/>}
    <div className="card table-card">
      <div className="table-heading"><h2>Organisation officers</h2><span>{rows.length} {rows.length===1?"member":"members"}</span></div>
      <div className="table-scroll"><table><thead><tr><th>Officer</th><th>Role</th><th>Status</th><th>Added</th></tr></thead><tbody>{rows.map((item)=><tr key={item.user_id}><td>{item.email??(key?`Officer ${pseudonymize(item.user_id,"team-display",key).slice(0,8)}`:"Officer")}</td><td>{roleLabels[item.role]??item.role}</td><td><span className={`status-pill ${item.active?"active":"inactive"}`}>{item.active?"Active":"Inactive"}</span></td><td>{new Date(item.joined_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
      {!rows.length&&<p className="empty-state">No officers have been added.</p>}
    </div>
    {!owner&&<p className="muted">Organisation owners manage invitations and role assignments.</p>}
  </section>;
}
