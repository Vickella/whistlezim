begin;

create or replace function public.self_register_organization(p_name text, p_slug text) returns uuid
language plpgsql security definer set search_path='' as $$
declare
  v_user uuid := auth.uid();
  v_org uuid;
  v_name text := trim(p_name);
  v_slug text := lower(trim(p_slug));
begin
  if v_user is null or not public.is_aal2() then
    raise exception 'access denied';
  end if;
  if not exists(select 1 from auth.users u where u.id=v_user and u.email_confirmed_at is not null) then
    raise exception 'verified email required';
  end if;
  if v_name is null or length(v_name) not between 2 and 160
    or v_slug is null or v_slug !~ '^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$'
    or v_slug in ('admin','api','auth','dashboard','login','register','report','security','status','support','track') then
    raise exception 'invalid organization';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user::text, 918273));
  if exists(select 1 from public.organization_members m where m.user_id=v_user) then
    raise exception 'membership already exists';
  end if;

  insert into public.organizations(name,slug,onboarding_state,intake_enabled)
    values(v_name,v_slug,'governance_required',false)
    returning id into v_org;
  insert into public.organization_members(organization_id,user_id,role,invited_by)
    values(v_org,v_user,'org_owner',v_user);
  insert into public.organization_verifications(organization_id,verification_type,status)
    values(v_org,'identity_and_authority','pending');
  insert into public.case_categories(organization_id,label,sort_order) values
    (v_org,'Fraud',10),
    (v_org,'Corruption and bribery',20),
    (v_org,'Harassment and discrimination',30),
    (v_org,'Health and safety',40),
    (v_org,'Conflicts of interest',50),
    (v_org,'Data and privacy',60),
    (v_org,'Other concern',70);
  return v_org;
end $$;

revoke all on function public.self_register_organization(text,text) from public;
grant execute on function public.self_register_organization(text,text) to authenticated;

commit;
