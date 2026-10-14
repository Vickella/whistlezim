begin;

alter table public.cases add column restricted boolean not null default false;
alter table public.cases add column restriction_reason_code text;
alter table public.cases add column resolution_code text;
alter table public.cases add column encrypted_resolution_summary jsonb;
alter table public.audit_events add column chain_sequence bigint generated always as identity;
create unique index audit_events_chain_sequence on public.audit_events(chain_sequence);

create table public.case_restriction_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations on delete cascade,
  case_id uuid not null references public.cases on delete cascade,
  requested_by uuid not null references auth.users,
  reason_code text not null check(length(reason_code) between 2 and 80),
  approved_by uuid references auth.users,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.case_conflicts (
  organization_id uuid not null references public.organizations on delete cascade,
  case_id uuid not null references public.cases on delete cascade,
  member_id uuid not null references auth.users on delete cascade,
  reason_code text not null check(length(reason_code) between 2 and 80),
  declared_at timestamptz not null default now(),
  primary key(case_id,member_id)
);

create table public.platform_operators (
  user_id uuid primary key references auth.users on delete cascade,
  active boolean not null default true,
  can_provision boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organization_verification_approvals (
  verification_id uuid not null references public.organization_verifications on delete cascade,
  operator_id uuid not null references auth.users,
  decision text not null check(decision in ('approve','reject')),
  evidence_reference text not null check(length(evidence_reference) between 8 and 240),
  created_at timestamptz not null default now(),
  primary key(verification_id,operator_id)
);

alter table public.case_restriction_requests enable row level security;
alter table public.case_conflicts enable row level security;
alter table public.platform_operators enable row level security;
alter table public.organization_verification_approvals enable row level security;

create or replace function public.is_aal2() returns boolean
language sql stable security definer set search_path=''
as $$ select coalesce((select auth.jwt()->>'aal'),'')='aal2' $$;
revoke all on function public.is_aal2() from public;
grant execute on function public.is_aal2() to authenticated;

create or replace function public.has_case_access(p_case uuid,p_org uuid) returns boolean
language sql stable security definer set search_path=''
as $$
  select public.is_aal2() and exists(
    select 1
    from public.case_access_grants g
    join public.organization_members m on m.organization_id=g.organization_id and m.user_id=g.member_id
    join public.cases c on c.id=g.case_id and c.organization_id=g.organization_id
    where g.case_id=p_case and g.organization_id=p_org and g.member_id=(select auth.uid())
      and g.revoked_at is null and m.active
      and (not c.restricted or m.role='independent_reviewer')
  )
$$;

drop policy if exists "members see own membership" on public.organization_members;
create policy "aal2 members see own membership" on public.organization_members for select to authenticated
using(public.is_aal2() and user_id=(select auth.uid()));
drop policy if exists "members see organization" on public.organizations;
create policy "aal2 members see organization" on public.organizations for select to authenticated
using(public.is_aal2() and exists(select 1 from public.organization_members m where m.organization_id=id and m.user_id=(select auth.uid()) and m.active));
drop policy if exists "own grants read" on public.case_access_grants;
create policy "aal2 own grants read" on public.case_access_grants for select to authenticated
using(public.is_aal2() and member_id=(select auth.uid()));
drop policy if exists "org audit read" on public.audit_events;
create policy "aal2 org audit read" on public.audit_events for select to authenticated
using(public.is_aal2() and exists(select 1 from public.organization_members m where m.organization_id=audit_events.organization_id and m.user_id=(select auth.uid()) and m.active and m.role in('org_owner','case_manager','independent_reviewer','auditor_readonly')));
create policy "aal2 granted attachments read" on public.attachments for select to authenticated
using(public.has_case_access(case_id,organization_id) and scan_status='clean');
create policy "aal2 retention read" on public.retention_jobs for select to authenticated
using(public.is_aal2() and exists(select 1 from public.organization_members m where m.organization_id=retention_jobs.organization_id and m.user_id=(select auth.uid()) and m.active and m.role in('case_manager','independent_reviewer')));
create policy "aal2 restriction requests read" on public.case_restriction_requests for select to authenticated
using(public.has_case_access(case_id,organization_id));
create policy "aal2 own conflicts read" on public.case_conflicts for select to authenticated
using(public.is_aal2() and member_id=(select auth.uid()));
create policy "operator reads own status" on public.platform_operators for select to authenticated
using(public.is_aal2() and user_id=(select auth.uid()) and active);

grant select on public.attachments,public.retention_jobs,public.case_restriction_requests,public.case_conflicts,public.platform_operators to authenticated;

create or replace function public.officer_case_action(
  p_case_id uuid,
  p_actor_id uuid,
  p_action text,
  p_encrypted_body jsonb,
  p_value text,
  p_safe_metadata jsonb,
  p_audit_id uuid,
  p_audit_created_at timestamptz,
  p_actor_pseudonym text,
  p_previous_mac text,
  p_integrity_mac text
) returns uuid
language plpgsql security definer set search_path=''
as $$
declare
  v_actor uuid := p_actor_id;
  v_org uuid;
  v_role public.org_role;
  v_restricted boolean;
  v_status public.case_status;
  v_current_mac text;
  v_result uuid := p_case_id;
  v_target uuid;
  v_request public.case_restriction_requests%rowtype;
begin
  if v_actor is null then raise exception 'access denied'; end if;
  select c.organization_id,c.restricted,c.status into v_org,v_restricted,v_status from public.cases c where c.id=p_case_id and c.deleted_at is null for update;
  if v_org is null then raise exception 'case unavailable'; end if;
  select m.role into v_role from public.organization_members m
    join public.case_access_grants g on g.organization_id=m.organization_id and g.member_id=m.user_id and g.case_id=p_case_id and g.revoked_at is null
    where m.organization_id=v_org and m.user_id=v_actor and m.active;
  if v_role is null or (p_action<>'read_case' and v_role in ('auditor_readonly','org_owner')) then raise exception 'access denied'; end if;
  if v_restricted and v_role<>'independent_reviewer' then raise exception 'access denied'; end if;
  if p_encrypted_body is not null and (jsonb_typeof(p_encrypted_body)<>'object' or pg_column_size(p_encrypted_body)>131072) then raise exception 'invalid encrypted content'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_org::text, 73491));
  select a.integrity_mac into v_current_mac from public.audit_events a where a.organization_id=v_org order by a.chain_sequence desc limit 1;
  if coalesce(v_current_mac,'') <> coalesce(p_previous_mac,'') then raise exception 'audit chain changed'; end if;

  case p_action
    when 'read_case' then
      null;
    when 'send_message' then
      if p_encrypted_body is null then raise exception 'content required'; end if;
      insert into public.case_messages(organization_id,case_id,sender_kind,sender_member_id,encrypted_body)
        values(v_org,p_case_id,'officer',v_actor,p_encrypted_body) returning id into v_result;
    when 'add_note' then
      if p_encrypted_body is null then raise exception 'content required'; end if;
      insert into public.case_notes(organization_id,case_id,author_id,encrypted_body)
        values(v_org,p_case_id,v_actor,p_encrypted_body) returning id into v_result;
    when 'change_status' then
      if not ((v_status='new' and p_value in ('acknowledged','triage')) or (v_status='acknowledged' and p_value='triage') or (v_status='triage' and p_value in ('investigating','awaiting_reporter')) or (v_status='investigating' and p_value='awaiting_reporter') or (v_status='awaiting_reporter' and p_value='investigating')) then raise exception 'invalid status transition'; end if;
      update public.cases set status=p_value::public.case_status,closed_at=case when p_value in('closed','archived') then now() else null end,updated_at=now() where id=p_case_id;
    when 'change_priority' then
      if p_value not in ('low','normal','high','urgent') then raise exception 'invalid priority'; end if;
      update public.cases set priority=p_value::public.case_priority,updated_at=now() where id=p_case_id;
    when 'assign' then
      if v_role not in ('case_manager','independent_reviewer') then raise exception 'access denied'; end if;
      v_target := p_value::uuid;
      if not exists(select 1 from public.organization_members m where m.organization_id=v_org and m.user_id=v_target and m.active and (not v_restricted or m.role='independent_reviewer')) or exists(select 1 from public.case_conflicts x where x.case_id=p_case_id and x.member_id=v_target) then raise exception 'invalid assignee'; end if;
      insert into public.case_access_grants(organization_id,case_id,member_id,grant_type,granted_by)
        values(v_org,p_case_id,v_target,case when v_restricted then 'restricted' else 'standard' end,v_actor)
        on conflict(case_id,member_id) do update set revoked_at=null,granted_by=excluded.granted_by,grant_type=excluded.grant_type;
      update public.cases set assigned_member_id=v_target,updated_at=now() where id=p_case_id;
    when 'request_restriction' then
      if v_role not in ('case_manager','independent_reviewer') or coalesce(length(p_value),0)<2 then raise exception 'access denied'; end if;
      insert into public.case_restriction_requests(organization_id,case_id,requested_by,reason_code) values(v_org,p_case_id,v_actor,p_value) returning id into v_result;
    when 'approve_restriction' then
      if v_role<>'independent_reviewer' then raise exception 'access denied'; end if;
      select * into v_request from public.case_restriction_requests where id=p_value::uuid and case_id=p_case_id and approved_at is null and rejected_at is null for update;
      if v_request.id is null or v_request.requested_by=v_actor then raise exception 'independent approval required'; end if;
      update public.case_restriction_requests set approved_by=v_actor,approved_at=now() where id=v_request.id;
      update public.cases set restricted=true,restriction_reason_code=v_request.reason_code,assigned_member_id=null,updated_at=now() where id=p_case_id;
      update public.case_access_grants g set revoked_at=now() where g.case_id=p_case_id and not exists(select 1 from public.organization_members m where m.organization_id=v_org and m.user_id=g.member_id and m.role='independent_reviewer');
    when 'set_hold' then
      if v_role not in ('case_manager','independent_reviewer') then raise exception 'access denied'; end if;
      update public.cases set hold_flag=true,updated_at=now() where id=p_case_id;
      update public.retention_jobs set status='held',hold_reason_code=p_value where case_id=p_case_id;
    when 'release_hold' then
      if v_role not in ('case_manager','independent_reviewer') then raise exception 'access denied'; end if;
      update public.cases set hold_flag=false,updated_at=now() where id=p_case_id;
      update public.retention_jobs set status='pending',hold_reason_code=null where case_id=p_case_id;
    when 'resolve' then
      if p_encrypted_body is null or coalesce(length(p_value),0)<2 then raise exception 'resolution required'; end if;
      if v_status not in ('triage','investigating','awaiting_reporter') then raise exception 'invalid status transition'; end if;
      update public.cases set status='resolved',resolution_code=p_value,encrypted_resolution_summary=p_encrypted_body,updated_at=now() where id=p_case_id;
    when 'close' then
      if v_status<>'resolved' or coalesce(length(p_value),0)<2 then raise exception 'invalid status transition'; end if;
      update public.cases set status='closed',closed_at=now(),updated_at=now() where id=p_case_id;
    when 'reopen' then
      if v_status not in ('resolved','closed') or coalesce(length(p_value),0)<2 then raise exception 'invalid status transition'; end if;
      update public.cases set status='investigating',closed_at=null,updated_at=now() where id=p_case_id;
    when 'archive' then
      if v_role<>'case_manager' or v_status<>'closed' or coalesce(length(p_value),0)<2 then raise exception 'invalid status transition'; end if;
      update public.cases set status='archived',updated_at=now() where id=p_case_id;
    when 'declare_conflict' then
      if coalesce(length(p_value),0)<2 then raise exception 'reason required'; end if;
      insert into public.case_conflicts(organization_id,case_id,member_id,reason_code) values(v_org,p_case_id,v_actor,p_value) on conflict(case_id,member_id) do update set reason_code=excluded.reason_code,declared_at=now();
      update public.case_access_grants set revoked_at=now(),conflict_reason_code=p_value where case_id=p_case_id and member_id=v_actor;
      update public.cases set assigned_member_id=null,updated_at=now() where id=p_case_id and assigned_member_id=v_actor;
    when 'export' then
      if v_role<>'case_manager' then raise exception 'access denied'; end if;
    else raise exception 'unsupported action';
  end case;

  insert into public.case_events(organization_id,case_id,event_type,actor_id,safe_metadata)
    values(v_org,p_case_id,p_action,v_actor,coalesce(p_safe_metadata,'{}'::jsonb));
  insert into public.audit_events(id,organization_id,actor_pseudonym,action,target_kind,target_id,success,safe_metadata,created_at,integrity_mac,previous_mac)
    values(p_audit_id,v_org,p_actor_pseudonym,p_action,'case',p_case_id,true,coalesce(p_safe_metadata,'{}'::jsonb),p_audit_created_at,p_integrity_mac,p_previous_mac);
  return v_result;
end $$;

revoke all on function public.officer_case_action(uuid,uuid,text,jsonb,text,jsonb,uuid,timestamptz,text,text,text) from public;
grant execute on function public.officer_case_action(uuid,uuid,text,jsonb,text,jsonb,uuid,timestamptz,text,text,text) to service_role;

create or replace function public.provision_organization(p_name text,p_slug text,p_owner uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare v_org uuid; v_verification uuid;
begin
  if not public.is_aal2() or not exists(select 1 from public.platform_operators where user_id=auth.uid() and active and can_provision) then raise exception 'access denied'; end if;
  if p_name is null or length(p_name) not between 2 and 160 or p_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$' or not exists(select 1 from auth.users where id=p_owner) then raise exception 'invalid organization'; end if;
  insert into public.organizations(name,slug,onboarding_state,intake_enabled) values(p_name,p_slug,'draft',false) returning id into v_org;
  insert into public.organization_members(organization_id,user_id,role,invited_by) values(v_org,p_owner,'org_owner',auth.uid());
  insert into public.organization_verifications(organization_id,verification_type,status) values(v_org,'identity_and_authority','pending') returning id into v_verification;
  return v_verification;
end $$;
revoke all on function public.provision_organization(text,text,uuid) from public;
grant execute on function public.provision_organization(text,text,uuid) to authenticated;

create or replace function public.review_organization_verification(p_verification uuid,p_decision text,p_evidence_reference text) returns text
language plpgsql security definer set search_path='' as $$
declare v_org uuid; v_approvals int;
begin
  if not public.is_aal2() or not exists(select 1 from public.platform_operators where user_id=auth.uid() and active and can_provision) then raise exception 'access denied'; end if;
  if p_decision not in ('approve','reject') or length(p_evidence_reference) not between 8 and 240 then raise exception 'invalid review'; end if;
  select organization_id into v_org from public.organization_verifications where id=p_verification and status='pending' for update;
  if v_org is null then raise exception 'verification unavailable'; end if;
  insert into public.organization_verification_approvals(verification_id,operator_id,decision,evidence_reference) values(p_verification,auth.uid(),p_decision,p_evidence_reference)
    on conflict(verification_id,operator_id) do update set decision=excluded.decision,evidence_reference=excluded.evidence_reference,created_at=now();
  if p_decision='reject' then update public.organization_verifications set status='rejected',reviewed_at=now(),proof_reference=p_evidence_reference where id=p_verification; return 'rejected'; end if;
  select count(*) into v_approvals from public.organization_verification_approvals where verification_id=p_verification and decision='approve';
  if v_approvals>=2 then update public.organization_verifications set status='approved',reviewed_at=now(),proof_reference='dual-operator evidence recorded' where id=p_verification; update public.organizations set verified_at=now(),onboarding_state='governance_required' where id=v_org; return 'approved'; end if;
  return 'second_approval_required';
end $$;
revoke all on function public.review_organization_verification(uuid,text,text) from public;
grant execute on function public.review_organization_verification(uuid,text,text) to authenticated;

create or replace function public.execute_retention(
  p_case_id uuid,p_audit_id uuid,p_audit_created_at timestamptz,p_actor_pseudonym text,p_previous_mac text,p_integrity_mac text
) returns void language plpgsql security definer set search_path='' as $$
declare v_org uuid; v_current_mac text;
begin
  select r.organization_id into v_org from public.retention_jobs r join public.cases c on c.id=r.case_id where r.case_id=p_case_id and r.status='pending' and r.due_at<=now() and not c.hold_flag for update;
  if v_org is null then raise exception 'retention not due'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_org::text,73491));
  select integrity_mac into v_current_mac from public.audit_events where organization_id=v_org order by chain_sequence desc limit 1;
  if coalesce(v_current_mac,'')<>coalesce(p_previous_mac,'') then raise exception 'audit chain changed'; end if;
  delete from public.cases where id=p_case_id;
  insert into public.audit_events(id,organization_id,actor_pseudonym,action,target_kind,target_id,success,safe_metadata,created_at,integrity_mac,previous_mac)
    values(p_audit_id,v_org,p_actor_pseudonym,'retention_delete','case_tombstone',p_case_id,true,'{}',p_audit_created_at,p_integrity_mac,p_previous_mac);
end $$;
revoke all on function public.execute_retention(uuid,uuid,timestamptz,text,text,text) from public;
grant execute on function public.execute_retention(uuid,uuid,timestamptz,text,text,text) to service_role;

commit;
