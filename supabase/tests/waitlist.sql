-- Local integration tests. Transaction rolls back all test rows and triggers.
begin;
set local role service_role;
select public.capture_waitlist(' Person@example.com ', true, 'en-US', 'primal-core-hero', '{"utm_campaign":"launch","unexpected":"discard"}', 'https://example.com', '/en/');
select public.capture_waitlist('PERSON@example.com', true, 'el');
reset role;
do $$
begin
  if (select count(*) from public.waitlist_signups) <> 1 then raise exception 'Duplicate was inserted'; end if;
  if (select count(*) from public.waitlist_consent_events) <> 1 then raise exception 'Consent duplicated'; end if;
  if not exists (select 1 from public.waitlist_signups where email = 'Person@example.com'
    and locale = 'en-US' and source = 'primal-core-hero' and utm = '{"utm_campaign":"launch"}'::jsonb
    and consented_at is not null and created_at is not null
    and consent_text_version = 'launch-updates-v1' and privacy_version = '2026-11-15')
    then raise exception 'Metadata/receipt missing or overwritten'; end if;
  if (select count(*) from pg_class where oid in ('public.waitlist_signups'::regclass,'public.waitlist_consent_events'::regclass) and relrowsecurity) <> 2
    then raise exception 'RLS is not enabled'; end if;
end $$;

update public.waitlist_signups set withdrawn_at = now() where lower(email) = 'person@example.com';
set local role service_role;
select public.capture_waitlist('person@example.com', true);
reset role;
do $$begin
  if not exists (select 1 from public.waitlist_signups where withdrawn_at is not null) then raise exception 'Withdrawal lost'; end if;
  if (select count(*) from public.waitlist_consent_events) <> 1 then raise exception 'Duplicate renewed consent'; end if;
  begin
    perform public.capture_waitlist('bad-address', true);
    raise exception 'Invalid email accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.capture_waitlist('valid@example.com', false);
    raise exception 'Missing consent accepted';
  exception when invalid_parameter_value then null; end;
end $$;

set local role anon;
do $$begin
  begin perform email from public.waitlist_signups; raise exception 'anon can read emails';
  exception when insufficient_privilege then null; end;
  begin perform * from public.waitlist_consent_events; raise exception 'anon can read consent';
  exception when insufficient_privilege then null; end;
  begin perform public.capture_waitlist('anon@example.com', true); raise exception 'anon can invoke capture';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$begin
  begin perform email from public.waitlist_signups; raise exception 'authenticated can read emails';
  exception when insufficient_privilege then null; end;
  begin perform public.capture_waitlist('auth@example.com', true); raise exception 'authenticated can invoke capture';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- An induced receipt failure must roll back the signup in the same transaction.
create function public.test_fail_receipt() returns trigger language plpgsql as $$
begin raise exception using errcode = '23514', message = 'test receipt failure'; end;
$$;
create trigger test_receipt_failure before insert on public.waitlist_consent_events
for each row execute function public.test_fail_receipt();
do $$begin
  begin
    perform public.capture_waitlist('rollback@example.com', true);
    raise exception 'Forced receipt failure did not propagate';
  exception when check_violation then null; end;
  if exists (select 1 from public.waitlist_signups where email = 'rollback@example.com')
    then raise exception 'Signup survived failed consent receipt'; end if;
end $$;
rollback;
