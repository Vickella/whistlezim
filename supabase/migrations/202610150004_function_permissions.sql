begin;

-- PostgreSQL grants new functions to PUBLIC by default. Make every privileged
-- API function explicit so anonymous and ordinary authenticated users cannot
-- call server only operations through PostgREST.
alter default privileges in schema public revoke execute on functions from public;
revoke all on function public.consume_submission_limit(text,text,integer) from public, anon, authenticated;
revoke all on function public.execute_retention(uuid,uuid,timestamptz,text,text,text) from public, anon, authenticated;
revoke all on function public.officer_case_action(uuid,uuid,text,jsonb,text,jsonb,uuid,timestamptz,text,text,text) from public, anon, authenticated;
revoke all on function public.record_failed_recovery(uuid) from public, anon, authenticated;
revoke all on function public.submit_report(uuid,uuid,uuid,text,jsonb,jsonb,text) from public, anon, authenticated;
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

grant execute on function public.consume_submission_limit(text,text,integer) to service_role;
grant execute on function public.execute_retention(uuid,uuid,timestamptz,text,text,text) to service_role;
grant execute on function public.officer_case_action(uuid,uuid,text,jsonb,text,jsonb,uuid,timestamptz,text,text,text) to service_role;
grant execute on function public.record_failed_recovery(uuid) to service_role;
grant execute on function public.submit_report(uuid,uuid,uuid,text,jsonb,jsonb,text) to service_role;

-- These functions enforce auth.uid(), MFA and role checks internally and are
-- intentionally available only to signed in users.
revoke all on function public.has_case_access(uuid,uuid) from public, anon;
revoke all on function public.is_aal2() from public, anon;
revoke all on function public.provision_organization(text,text,uuid) from public, anon;
revoke all on function public.review_organization_verification(uuid,text,text) from public, anon;
revoke all on function public.self_register_organization(text,text) from public, anon;

grant execute on function public.has_case_access(uuid,uuid) to authenticated;
grant execute on function public.is_aal2() to authenticated;
grant execute on function public.provision_organization(text,text,uuid) to authenticated;
grant execute on function public.review_organization_verification(uuid,text,text) to authenticated;
grant execute on function public.self_register_organization(text,text) to authenticated;

commit;
