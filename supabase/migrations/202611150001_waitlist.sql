-- Run once in the intended Supabase project's SQL Editor or via reviewed migrations.
-- Private tables and an atomic service-role-only RPC. No public browser database access.
begin;

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = btrim(email) and char_length(email) between 3 and 254),
  created_at timestamptz not null default now(),
  consented_at timestamptz not null default now(),
  marketing_consent boolean not null check (marketing_consent),
  consent_text_version text not null,
  privacy_version text not null,
  locale text not null check (locale in ('el', 'en-US')),
  source text not null,
  landing_path text check (char_length(landing_path) <= 256),
  utm jsonb not null default '{}'::jsonb check (jsonb_typeof(utm) = 'object'),
  referrer_origin text check (char_length(referrer_origin) <= 256),
  withdrawn_at timestamptz
);
create unique index waitlist_signups_email_ci on public.waitlist_signups (lower(email));

create table public.waitlist_consent_events (
  id uuid primary key default gen_random_uuid(),
  signup_id uuid not null references public.waitlist_signups(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  event_type text not null check (event_type in ('granted', 'withdrawn')),
  consent_text_version text not null,
  privacy_version text not null,
  locale text not null check (locale in ('el', 'en-US'))
);

alter table public.waitlist_signups enable row level security;
alter table public.waitlist_consent_events enable row level security;
revoke all on table public.waitlist_signups, public.waitlist_consent_events from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist_signups, public.waitlist_consent_events to service_role;

create function public.capture_waitlist(
  p_email text,
  p_consent boolean,
  p_locale text default 'el',
  p_source text default 'primal-core-waitlist',
  p_utm jsonb default '{}'::jsonb,
  p_referrer_origin text default null,
  p_landing_path text default null
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_email text := btrim(p_email);
  v_utm jsonb := '{}'::jsonb;
  v_key text;
  v_consent_version constant text := 'launch-updates-v1';
  v_privacy_version constant text := '2026-11-15';
begin
  if p_consent is distinct from true or v_email is null
    or char_length(v_email) > 254
    or v_email !~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$'
    or v_email ~ '[[:cntrl:]]'
    or p_locale is null or p_locale not in ('el', 'en-US')
    or p_source is null or p_source not in ('primal-core-waitlist','primal-core-hero','primal-core-footer')
    or p_utm is null or jsonb_typeof(p_utm) <> 'object'
  then raise exception using errcode = '22023', message = 'Invalid signup'; end if;

  foreach v_key in array array['utm_source','utm_medium','utm_campaign','utm_term','utm_content'] loop
    if jsonb_typeof(p_utm -> v_key) = 'string' then
      v_utm := v_utm || jsonb_build_object(v_key, left(p_utm ->> v_key, 128));
    end if;
  end loop;
  insert into public.waitlist_signups
    (email, marketing_consent, consent_text_version, privacy_version, locale, source, utm, referrer_origin, landing_path)
  values
    (v_email, true, v_consent_version, v_privacy_version, p_locale, p_source, v_utm,
     left(p_referrer_origin, 256), left(p_landing_path, 256))
  on conflict (lower(email)) do nothing
  returning id into v_id;

  if v_id is not null then
    insert into public.waitlist_consent_events
      (signup_id, event_type, consent_text_version, privacy_version, locale)
    values (v_id, 'granted', v_consent_version, v_privacy_version, p_locale);
  end if;
  -- Same response for new, duplicate or withdrawn records. Never expose membership,
  -- overwrite original consent, or silently re-subscribe a withdrawn address.
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.capture_waitlist(text, boolean, text, text, jsonb, text, text)
  from public, anon, authenticated;
grant execute on function public.capture_waitlist(text, boolean, text, text, jsonb, text, text) to service_role;

comment on column public.waitlist_signups.consent_text_version is
'launch-updates-v1 / el: Συμφωνώ να λαμβάνω ενημερώσεις κυκλοφορίας και έχω διαβάσει την πολιτική απορρήτου. / en-US: I agree to receive launch updates and have read the privacy policy.';
commit;
