-- Apply after the original migration before enabling SKIN_PROFILE_RESEARCH_V2_ENABLED.
-- V2 distributions are separate from legacy research; no response-level joins.
begin;
alter table public.skin_profile_counts drop constraint skin_profile_counts_metric_check;
alter table public.skin_profile_counts add constraint skin_profile_counts_metric_check check (
 metric ~ '^research:(interest:[0-3]|spend:[0-5]|decision:[0-5])$'
 or metric ~ '^research_v2:(problem:[0-7]|routine:[0-6]|unmet:[0-8]|concept:[0-6]|price:[0-6])$'
 or metric in ('event:lead_magnet_view','event:quiz_start','event:quiz_step_complete','event:quiz_complete','event:result_view','event:result_copy','event:email_delivery_requested','event:marketing_opt_in','event:product_concept_view','event:product_interest_click','event:research_complete','event:early_access_signup'));
create or replace function public.record_skin_profile_counts(entries jsonb) returns boolean
language plpgsql security definer set search_path=public,pg_temp as $$
declare entry jsonb;
begin
 if entries is null or jsonb_typeof(entries)<>'array' or jsonb_array_length(entries) not between 1 and 5 then raise exception 'invalid counts'; end if;
 for entry in select * from jsonb_array_elements(entries) loop
  if jsonb_typeof(entry)<>'object' or not(entry?'metric') or (select count(*)from jsonb_object_keys(entry))<>1 then raise exception 'invalid metric'; end if;
  insert into public.skin_profile_counts(day,metric,total) values(current_date,entry->>'metric',1)
  on conflict(day,metric) do update set total=skin_profile_counts.total+1;
 end loop;
 delete from public.skin_profile_counts where day<current_date-90;
 return true;
end $$;
revoke all on function public.record_skin_profile_counts(jsonb) from public,anon,authenticated;
grant execute on function public.record_skin_profile_counts(jsonb) to service_role;
commit;
