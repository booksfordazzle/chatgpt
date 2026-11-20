import {researchSheetsSettings,saveResearchToSheets} from './skin-research-sheets.mjs';
import nodemailer from 'nodemailer';
import {smtpSettings} from './welcome-email.mjs';
import {validResult} from '../public/skin-profile/engine.mjs';
import {resultText} from '../public/skin-profile/content.mjs';
import {createSubmissionLimiter,rejectsBrowserOrigin} from '../netlify/functions/lib/request-guard.mjs';
export const funnelEvents=['lead_magnet_view','quiz_start','quiz_step_complete','quiz_complete','result_view','result_copy','email_delivery_requested','marketing_opt_in','product_concept_view','product_interest_click','research_complete','early_access_signup'];
const emailPattern=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const keys=(value,allowed)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>allowed.includes(k));
function researchValid(d){return keys(d,['action','interest','spend','decision','consent'])&&d.consent===true&&['interest','spend','decision'].every((k,i)=>d[k]===null||Number.isInteger(d[k])&&d[k]>=0&&d[k]<[4,6,6][i])&&['interest','spend','decision'].some(k=>d[k]!==null);}

const researchV2Fields={problem:8,routine:7,unmet:9,concept:7,price:7};
function researchV2Valid(d){return keys(d,['action','consent','submissionId',...Object.keys(researchV2Fields)])&&d.consent===true&&typeof d.submissionId==='string'&&/^[a-f0-9-]{36}$/i.test(d.submissionId)&&Object.entries(researchV2Fields).every(([k,n])=>Number.isInteger(d[k])&&d[k]>=0&&d[k]<n)&&Object.keys(researchV2Fields).some(k=>d[k]!==null);}
function database(env){
 const u=new URL(env.SKIN_PROFILE_SUPABASE_URL);
 if(u.protocol!=='https:'||!u.hostname.endsWith('.supabase.co')||u.pathname!=='/'||u.search||u.hash||u.username||u.password||u.port||!env.SKIN_PROFILE_SUPABASE_SERVICE_ROLE_KEY)throw Error('not_configured');
 return u.origin+'/rest/v1/rpc/record_skin_profile_counts';
}
export function createSkinProfileHandler({env=process.env,fetchImpl=fetch,createTransport=nodemailer.createTransport,limit=createSubmissionLimiter({emailLimit:3,ipLimit:30})}={}){
 const aggregateLimit=createSubmissionLimiter({emailLimit:1000,ipLimit:120});
 const dbReady=()=>{try{database(env);return true;}catch{return false;}};
 const sheetsReady=()=>{try{researchSheetsSettings(env);return env.SKIN_PROFILE_RESEARCH_V2_ENABLED==='true';}catch{return false;}};
 const mailReady=()=>{try{smtpSettings(env);return env.SKIN_PROFILE_EMAIL_ENABLED==='true';}catch{return false;}};
 async function count(entries){const response=await fetchImpl(database(env),{method:'POST',redirect:'error',signal:AbortSignal.timeout(6000),headers:{'Content-Type':'application/json',apikey:env.SKIN_PROFILE_SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SKIN_PROFILE_SUPABASE_SERVICE_ROLE_KEY},body:JSON.stringify({entries})});if(!response.ok)throw Error();const saved=await response.json();if(saved!==true)throw Error();}
 return async(req,res)=>{
  const reply=(status,data)=>{res.statusCode=status;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data));};
  if(req.method==='GET')return reply(200,{email:mailReady(),research:dbReady(),researchV2:sheetsReady(),analytics:dbReady()&&env.SKIN_PROFILE_ANALYTICS_ENABLED==='true'});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return reply(405,{ok:false});}
  if(rejectsBrowserOrigin(req.headers)||!req.headers?.origin)return reply(403,{ok:false});
  if(!/application\/json/i.test(req.headers?.['content-type']||''))return reply(415,{ok:false});
  let d;
  try{if(Number(req.headers?.['content-length']||0)>2048)throw Error();let raw='';if(req.body!==undefined)raw=Buffer.isBuffer(req.body)?req.body.toString():typeof req.body==='string'?req.body:JSON.stringify(req.body);else for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>2048)throw Error();}if(Buffer.byteLength(raw)>2048)throw Error();d=JSON.parse(raw);if(!d||Array.isArray(d)||typeof d!=='object')throw Error();}catch{return reply(400,{ok:false});}
  if(!['email','research','research-v2','event'].includes(d.action))return reply(400,{ok:false});
  if(d.action==='email'){
   if(!keys(d,['action','email','result','deliveryConsent','adult'])||d.deliveryConsent!==true||d.adult!==true||typeof d.email!=='string'||d.email.length>254||!emailPattern.test(d.email)||/[\r\n\x00]/.test(d.email)||!validResult(d.result))return reply(400,{ok:false});
  }else if(d.action==='research-v2'&&!researchV2Valid(d))return reply(400,{ok:false});
  else if(d.action==='research'&&!researchValid(d))return reply(400,{ok:false});
  else if(d.action==='event'&&(!keys(d,['action','name','consent'])||d.consent!==true||!funnelEvents.includes(d.name)))return reply(400,{ok:false});
  const permission=d.action==='email'?limit(d.email,req.headers):aggregateLimit('anonymous-'+d.action,req.headers);
  if(!permission.allowed){res.setHeader('Retry-After',String(permission.retryAfter));return reply(429,{ok:false,code:'rate_limited'});}
  if(d.action==='email'){
   if(!mailReady())return reply(503,{ok:false,code:'unavailable'});
   // Only fixed educational content is mailed; no arbitrary HTML, attachments,
   // raw answers, marketing subscription or database writes on this path.
   const transport=createTransport(smtpSettings(env));
   try{const sent=await transport.sendMail({from:{name:'PRIMAL CORE',address:'hello@primalcore.gr'},replyTo:'hello@primalcore.gr',to:d.email,envelope:{from:'hello@primalcore.gr',to:[d.email]},subject:'PRIMAL CORE — Η σύνοψη της καθημερινής σου φροντίδας',text:resultText(d.result)});if(!sent.accepted?.some(a=>String(a).toLowerCase()===d.email.toLowerCase()))throw Error();return reply(200,{ok:true,status:'accepted'});}catch{return reply(502,{ok:false,code:'send_unconfirmed'});}finally{transport.close();}
  }
  if(d.action==='research-v2'){
   if(!sheetsReady())return reply(503,{ok:false,code:'unavailable'});
   try{const {action,...answers}=d;await saveResearchToSheets(answers,{env,fetchImpl});return reply(200,{ok:true});}catch{return reply(503,{ok:false,code:'unavailable'});}
  }
  if(!dbReady()||d.action==='event'&&env.SKIN_PROFILE_ANALYTICS_ENABLED!=='true')return reply(503,{ok:false,code:'unavailable'});
  const entries=d.action==='event'?[{metric:'event:'+d.name}]:['interest','spend','decision'].filter(k=>d[k]!==null).map(k=>({metric:'research:'+k+':'+d[k]}));
  try{await count(entries);return reply(200,{ok:true});}catch{return reply(503,{ok:false,code:'unavailable'});}
 };
}
