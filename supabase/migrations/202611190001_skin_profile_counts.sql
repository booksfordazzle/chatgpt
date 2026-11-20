-- Optional aggregate research/funnel storage. No emails, profiles, raw quiz
-- answers, event payloads, IPs, visitor IDs or response-level rows.
begin;
create table public.skin_profile_counts (
 day date not null default current_date,
 metric text not null check (
 metric ~ '^research:(interest:[0-3]|spend:[0-5]|decision:[0-5])$'
 or metric in ('event:lead_magnet_view','event:quiz_start','event:quiz_step_complete','event:quiz_complete','event:result_view','event:result_copy','event:email_delivery_requested','event:marketing_opt_in','event:product_concept_view','event:product_interest_click','event:research_complete','event:early_access_signup')),
 total bigint not null default 0 check(total>=0),
 primary key(day,metric)
);
alter table public.skin_profile_counts enable row level security;
revoke all on public.skin_profile_counts from public,anon,authenticated;
create function public.record_skin_profile_counts(entries jsonb) returns boolean
language plpgsql security definer set search_path=public,pg_temp as $$
declare entry jsonb;
begin
 if entries is null or jsonb_typeof(entries)<>'array' or jsonb_array_length(entries) not between 1 and 3 then raise exception 'invalid counts'; end if;
 for entry in select * from jsonb_array_elements(entries) loop
  if jsonb_typeof(entry)<>'object' or not(entry?'metric') or (select count(*)from jsonb_object_keys(entry))<>1 then raise exception 'invalid metric'; end if;
  insert into public.skin_profile_counts(day,metric,total) values(current_date,entry->>'metric',1)
  on conflict(day,metric) do update set total=skin_profile_counts.total+1;
 end loop;
 -- An active installation retains at most 90 days of daily aggregate rows.
 delete from public.skin_profile_counts where day<current_date-90;
 return true;
end $$;
revoke all on function public.record_skin_profile_counts(jsonb) from public,anon,authenticated;
grant execute on function public.record_skin_profile_counts(jsonb) to service_role;
-- Reporting categories are aggregate events, never personal skin-profile segments.
create view public.skin_profile_funnel_daily with (security_invoker=true) as
 select days.day, stages.segment, stages.event_name,
 case when stages.event_name is null then null else coalesce(counts.total,0) end as observed_events,
 stages.measurement_status
 from (select distinct day from public.skin_profile_counts) days
 cross join (values
 ('visitor','event:lead_magnet_view','consented_events_only'),
 ('engaged_visitor','event:quiz_complete','consented_events_only'),
 ('content_lead','event:email_delivery_requested','requested_not_delivery_confirmed'),
 ('marketing_subscriber','event:early_access_signup','confirmed_signup_events_only'),
 ('product_interested','event:product_interest_click','interest_click_not_purchase'),
 ('qualified_lead',null,'not_measured_requires_price_research'),
 ('customer',null,'not_measured_prelaunch')
 ) as stages(segment,event_name,measurement_status)
 left join public.skin_profile_counts counts on counts.day=days.day and counts.metric=stages.event_name;
revoke all on public.skin_profile_funnel_daily from public,anon,authenticated;
grant select on public.skin_profile_counts,public.skin_profile_funnel_daily to service_role;
commit;
