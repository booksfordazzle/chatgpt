-- Internal SQL-editor/service-role report. Anonymous daily event aggregates,
-- not unique visitors/leads and not an email-linked profiling database.
select day,segment,observed_events,measurement_status
from public.skin_profile_funnel_daily
where day>=current_date-28
order by day desc,segment;

-- Demand research: separate marginal distributions, not proof of willingness
-- to pay or joint qualification. Never join these counters to email records.
select metric,sum(total) as observed_answers
from public.skin_profile_counts
where metric like 'research:%' and day>=current_date-28
group by metric order by metric;

-- V2: hypothetical willingness-to-pay for a 50ml concept, not the legacy
-- usual-spend question, observed purchases, or an identified qualified lead.
-- Each distribution is separate; no cross-question/person joins are possible.
select metric,sum(total) as observed_answers
from public.skin_profile_counts
where metric like 'research_v2:%' and day>=current_date-28
group by metric order by metric;
