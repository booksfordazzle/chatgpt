import { timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { welcomeHtml, welcomeAttachments } from './welcome-template.mjs';
const SENDER = 'hello@primalcore.gr';
function authorized(value, secret) {
  if (!secret || typeof value !== 'string') return false;
  const expected=Buffer.from(`Bearer ${secret}`),actual=Buffer.from(value);
  return actual.length===expected.length && timingSafeEqual(actual,expected);
}
const CONFIG_CODES = ['smtp_host_missing','smtp_host_invalid','smtp_port_invalid','smtp_user_invalid','smtp_password_missing','receiver_not_configured'];
export function smtpSettings(env) {
  const host=typeof env.SMTP_HOST==='string'?env.SMTP_HOST.trim().toLowerCase():'';
  const user=typeof env.SMTP_USER==='string'?env.SMTP_USER.trim().toLowerCase():'';
  const port=Number(env.SMTP_PORT);
  if(!host)throw Error('smtp_host_missing');
  if(host!=='smtp-gr.securemail.pro')throw Error('smtp_host_invalid');
  if(![465,587].includes(port))throw Error('smtp_port_invalid');
  if(user!==SENDER)throw Error('smtp_user_invalid');
  if(typeof env.SMTP_PASSWORD!=='string'||!env.SMTP_PASSWORD)throw Error('smtp_password_missing');
  return {host,port,secure:port===465,requireTLS:true,auth:{user:SENDER,pass:env.SMTP_PASSWORD},tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true};
}
function readinessFailure(error) {
  if(error?.code==='EAUTH')return 'smtp_auth_failed';
  if(error?.code==='ETIMEDOUT')return 'smtp_timeout';
  if(['EDNS','ENOTFOUND','EAI_AGAIN'].includes(error?.code))return 'smtp_dns_failed';
  if(['CERT_HAS_EXPIRED','DEPTH_ZERO_SELF_SIGNED_CERT','ERR_TLS_CERT_ALTNAME_INVALID','UNABLE_TO_VERIFY_LEAF_SIGNATURE'].includes(error?.code))return 'smtp_tls_failed';
  return 'smtp_connection_failed';
}
export function welcomeMessage(email,locale) {
  const english=locale==='en-US';
  return {from:{name:'PRIMAL CORE',address:SENDER},replyTo:SENDER,to:email,envelope:{from:SENDER,to:[email]},
    html:welcomeHtml(locale),attachments:welcomeAttachments(locale),
    subject:english?'PRIMAL CORE — Welcome':'PRIMAL CORE — Καλώς ήρθες',
    text:english?'Welcome. You’ll receive a message when PRIMAL CORE is ready to launch.\n\nPRIMAL CORE\nhttps://primalcore.gr/en\n\nTo stop receiving updates, reply to this email.':'Καλώς ήρθες. Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.\n\nPRIMAL CORE\nhttps://primalcore.gr/\n\nΑν δεν θέλεις να λαμβάνεις ενημερώσεις, απάντησε σε αυτό το email.'};
}
async function claimJob(job,env,fetchImpl,action='claim-welcome-smtp') {
  const endpoint=new URL(env.GOOGLE_APPS_SCRIPT_URL);
  if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname)||endpoint.search||endpoint.username||endpoint.password||endpoint.port)throw Error('invalid_receiver');
  const signal=AbortSignal.timeout(15000);
  let response=await fetchImpl(endpoint.href,{method:'POST',redirect:'manual',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({token:env.WAITLIST_SHARED_SECRET,action,...job})});
  if([302,303].includes(response.status)){
    const target=new URL(response.headers.get('location'));
    if(target.protocol!=='https:'||target.hostname!=='script.googleusercontent.com'||target.pathname!=='/macros/echo'||target.port||target.username||target.password)throw Error('invalid_redirect');
    response=await fetchImpl(target.href,{method:'GET',redirect:'error',signal});
  }
  if(!response.ok)throw Error('claim_unavailable');
  return (await response.json()).ok===true;
}
export function createWelcomeHandler({env=process.env,fetchImpl=fetch,createTransport=nodemailer.createTransport}={}) {
  return async function(req,res){
    const reply=(code,data)=>{res.statusCode=code;res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data));};
    if(!authorized(req.headers?.authorization,env.WAITLIST_SHARED_SECRET))return reply(401,{ok:false,code:'auth_failed'});
    if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return reply(405,{ok:false});}
    let settings;
    try{settings=smtpSettings(env);if(!env.GOOGLE_APPS_SCRIPT_URL)throw Error('receiver_not_configured');}catch(error){return reply(503,{ok:false,retrySafe:true,code:CONFIG_CODES.includes(error?.message)?error.message:'smtp_not_configured'});}
    if(req.method==='GET'){
      // Authenticated readiness check verifies TLS/login without sending any mail.
      const transport=createTransport(settings);
      try{await transport.verify();}catch(error){return reply(503,{ok:false,retrySafe:true,code:readinessFailure(error)});}finally{transport.close();}
      if(new URL(req.url || '/', 'https://primalcore.gr').searchParams.get('receiver')==='1'){
        try{if(!await claimJob({},env,fetchImpl,'check-welcome-smtp'))return reply(503,{ok:false,retrySafe:true,code:'receiver_not_ready'});}
        catch{return reply(503,{ok:false,retrySafe:true,code:'receiver_check_failed'});}
      }
      return reply(200,{ok:true});
    }
    let job;
    try{
      if(!/application\/json/i.test(req.headers?.['content-type']||''))throw Error();
      if(Number(req.headers?.['content-length']||0)>2048)throw Error();
      if(req.body!==undefined){const raw=Buffer.isBuffer(req.body)?req.body.toString():typeof req.body==='string'?req.body:JSON.stringify(req.body);if(Buffer.byteLength(raw)>2048)throw Error();job=JSON.parse(raw);}
      else{let raw='';for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>2048)throw Error();}job=JSON.parse(raw);}
      if(!job||!Number.isSafeInteger(job.rowNumber)||job.rowNumber<2||typeof job.email!=='string'||job.email.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(job.email)||/[\r\n\x00<>]/.test(job.email)||!['el','en-US'].includes(job.locale)||typeof job.registeredAt!=='string'||!/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(job.registeredAt))throw Error();
      job={rowNumber:job.rowNumber,email:job.email,locale:job.locale,registeredAt:job.registeredAt};
    }catch{return reply(400,{ok:false});}
    // The Sheet atomically authorizes each job once. Replays cannot send twice,
    // even across concurrent Vercel instances or process restarts.
    try{if(!await claimJob(job,env,fetchImpl))return reply(409,{ok:false,code:'job_not_available'});}catch{return reply(502,{ok:false,code:'claim_unavailable'});}
    const transport=createTransport(settings);
    try{
      const result=await transport.sendMail(welcomeMessage(job.email,job.locale));
      if(!result.accepted?.some(address=>String(address).toLowerCase()===job.email.toLowerCase()))throw Error();
      return reply(200,{ok:true});
    }catch{return reply(502,{ok:false,code:'smtp_send_unconfirmed'});}finally{transport.close();}
  };
}
