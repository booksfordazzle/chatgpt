import { timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
const SENDER = 'hello@primalcore.gr';
function authorized(value, secret) {
  if (!secret || typeof value !== 'string') return false;
  const expected=Buffer.from(`Bearer ${secret}`),actual=Buffer.from(value);
  return actual.length===expected.length && timingSafeEqual(actual,expected);
}
export function smtpSettings(env) {
  const port=Number(env.SMTP_PORT);
  if(env.SMTP_HOST!=='smtp-gr.securemail.pro'||![465,587].includes(port)||env.SMTP_USER!==SENDER||!env.SMTP_PASSWORD)throw Error('smtp_not_configured');
  return {host:env.SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:SENDER,pass:env.SMTP_PASSWORD},tls:{minVersion:'TLSv1.2',rejectUnauthorized:true},connectionTimeout:8000,greetingTimeout:8000,socketTimeout:12000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true};
}
export function welcomeMessage(email,locale) {
  const english=locale==='en-US';
  return {from:{name:'PRIMAL CORE',address:SENDER},replyTo:SENDER,to:email,envelope:{from:SENDER,to:[email]},
    subject:english?'PRIMAL CORE — Thank you for your trust':'PRIMAL CORE — Σε ευχαριστούμε για την εμπιστοσύνη',
    text:english?'Thank you for your trust. You’ll receive a message when PRIMAL CORE is ready to launch.\n\nPRIMAL CORE\nhttps://primalcore.gr/en\n\nTo stop receiving updates, reply to this email.':'Σε ευχαριστούμε για την εμπιστοσύνη. Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.\n\nPRIMAL CORE\nhttps://primalcore.gr/\n\nΑν δεν θέλεις να λαμβάνεις ενημερώσεις, απάντησε σε αυτό το email.'};
}
async function claimJob(job,env,fetchImpl) {
  const endpoint=new URL(env.GOOGLE_APPS_SCRIPT_URL);
  if(endpoint.protocol!=='https:'||endpoint.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname)||endpoint.search||endpoint.username||endpoint.password||endpoint.port)throw Error('invalid_receiver');
  const signal=AbortSignal.timeout(15000);
  let response=await fetchImpl(endpoint.href,{method:'POST',redirect:'manual',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({token:env.WAITLIST_SHARED_SECRET,action:'claim-welcome-smtp',...job})});
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
    if(!authorized(req.headers?.authorization,env.WAITLIST_SHARED_SECRET))return reply(401,{ok:false});
    if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return reply(405,{ok:false});}
    let settings;
    try{settings=smtpSettings(env);if(!env.GOOGLE_APPS_SCRIPT_URL)throw Error();}catch{return reply(503,{ok:false,retrySafe:true,code:'smtp_not_configured'});}
    if(req.method==='GET'){
      // Authenticated readiness check verifies TLS/login without sending any mail.
      const transport=createTransport(settings);
      try{await transport.verify();return reply(200,{ok:true});}catch{return reply(503,{ok:false,retrySafe:true,code:'smtp_connection_failed'});}finally{transport.close();}
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
