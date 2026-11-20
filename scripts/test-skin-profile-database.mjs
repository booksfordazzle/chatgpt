import{execFileSync}from'node:child_process';
import{readFileSync}from'node:fs';
const name='primal-skin-test-'+process.pid;
const docker=args=>execFileSync('docker',args,{encoding:'utf8',stdio:['pipe','pipe','pipe']});
const sql=input=>execFileSync('docker',['exec','-i',name,'psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-q'],{input,encoding:'utf8',stdio:['pipe','pipe','pipe']});
try{
 docker(['run','--rm','-d','--network','none','--name',name,'-e','POSTGRES_HOST_AUTH_METHOD=trust','postgres:17-alpine@sha256:a77aa70e641402a21411b92b721c58d10f23b50ae5fdd2333efd22d166e1e5f7']);
 let ready=false;for(let i=0;i<40;i++){try{if(docker(['exec',name,'cat','/proc/1/comm']).trim()!=='postgres')throw Error('initializing');docker(['exec',name,'pg_isready','-U','postgres']);ready=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}
 if(!ready)throw Error('Local database unavailable');
 sql('create role anon; create role authenticated; create role service_role bypassrls;');
 sql(readFileSync('supabase/migrations/202611190001_skin_profile_counts.sql','utf8'));
 sql(readFileSync('supabase/migrations/202611200001_skin_profile_research_v2.sql','utf8'));
 sql("set role service_role;select public.record_skin_profile_counts('[{\"metric\":\"research_v2:problem:7\"},{\"metric\":\"research_v2:routine:6\"},{\"metric\":\"research_v2:unmet:8\"},{\"metric\":\"research_v2:concept:6\"},{\"metric\":\"research_v2:price:6\"}]');reset role;");
 sql("set role service_role;select public.record_skin_profile_counts('[{\"metric\":\"research:interest:0\"},{\"metric\":\"research:spend:3\"}]');select public.record_skin_profile_counts('[{\"metric\":\"research:interest:0\"}]');reset role;do $$begin if(select total from public.skin_profile_counts where metric='research:interest:0')<>2 then raise exception 'count mismatch';end if;end$$;");
 for(const input of ['select public.record_skin_profile_counts(\'[ {"metric":"research_v2:price:7"} ]\');',"set role anon;select * from public.skin_profile_counts;","set role authenticated;select public.record_skin_profile_counts('[{\"metric\":\"event:quiz_start\"}]');","select public.record_skin_profile_counts(null);","select public.record_skin_profile_counts('[{\"metric\":\"profile:C\"}]');","select public.record_skin_profile_counts('[{\"metric\":\"research:interest:0\",\"email\":\"private@example.com\"}]');"]){let failed=false;try{sql(input);}catch{failed=true;}if(!failed)throw Error('Invalid access or data accepted');}
 sql("set role service_role; select public.record_skin_profile_counts('[{\"metric\":\"event:quiz_complete\"}]');reset role;do $$begin if(select observed_events from public.skin_profile_funnel_daily where segment='engaged_visitor')<>1 then raise exception 'funnel mismatch';end if;if exists(select 1 from public.skin_profile_funnel_daily where segment in('qualified_lead','customer')and observed_events is not null)then raise exception 'invented lead qualification';end if;end$$;");
 console.log('PASS isolated PostgreSQL: migration, aggregate increments, allowlist constraints, no personal payloads, service-only RPC, anonymous access denied.');
}finally{try{docker(['rm','-f',name]);}catch{}}
