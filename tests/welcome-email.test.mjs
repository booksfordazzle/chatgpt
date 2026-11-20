import test from 'node:test';
import assert from 'node:assert/strict';
import {createWelcomeHandler,smtpSettings} from '../server/welcome-email.mjs';
const env={WAITLIST_SHARED_SECRET:'private-secret',SMTP_HOST:'smtp-gr.securemail.pro',SMTP_PORT:'465',SMTP_USER:'hello@primalcore.gr',SMTP_PASSWORD:'private-password',GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/example/exec'};
const job={rowNumber:2,email:'owned@example.com',locale:'el',registeredAt:'2026-11-17T10:00:00.000Z'};
async function run({url,settings=env,body=job,auth='Bearer private-secret',method='POST',fetchImpl=async()=>new Response('{"ok":true}'),fails=false,verifyFails=false}={}){
 const calls=[],messages=[];let closed=0;
 const handler=createWelcomeHandler({env:settings,fetchImpl:async(...args)=>{calls.push(args);return fetchImpl(...args)},createTransport:config=>{assert.equal(config.tls.rejectUnauthorized,true);assert.equal(config.requireTLS,true);return {verify:async()=>{if(verifyFails)throw Object.assign(Error('SECRET'),{code:typeof verifyFails==='string'?verifyFails:undefined})},sendMail:async message=>{messages.push(message);if(fails)throw Error('SECRET');return {accepted:[message.to]}},close:()=>closed++}}});
 const res={setHeader(){},end(body){this.body=JSON.parse(body)}};
 await handler({method,url,headers:{authorization:auth,'content-type':'application/json'},body},res);return{...res,calls,messages,closed};
}
test('SMTP relay denies unauthenticated callers, malformed recipients and oversized bodies',async()=>{
 for(const args of[{auth:''},{auth:'Bearer wrong'},{body:{...job,email:'a@example.com\nBcc: b@example.com'}},{body:{...job,rowNumber:1}},{body:{...job,extra:'x'.repeat(3000)}}]){
  const r=await run(args);assert([400,401].includes(r.statusCode));assert.equal(r.calls.length,0);assert.equal(r.messages.length,0);
 }
});
test('SMTP has fixed authenticated hello identity, TLS verification, no Gmail fallback or arbitrary destination host',async()=>{
 assert.equal(smtpSettings(env).secure,true);assert.equal(smtpSettings({...env,SMTP_PORT:'587'}).secure,false);
 for(const setting of[{SMTP_HOST:'attacker.test'},{SMTP_USER:'other@example.com'},{SMTP_PORT:'25'},{SMTP_PASSWORD:''}])assert.throws(()=>smtpSettings({...env,...setting}));
 const r=await run();assert.equal(r.statusCode,200);assert.equal(r.messages[0].from.address,'hello@primalcore.gr');assert.equal(r.messages[0].replyTo,'hello@primalcore.gr');assert.deepEqual(r.messages[0].envelope.to,[job.email]);assert(r.messages[0].text.startsWith('Σε ευχαριστούμε.'));
 assert.equal(JSON.parse(r.calls[0][1].body).action,'claim-welcome-smtp');assert.equal(r.closed,1);
});
test('Sheet durable claim denies duplicate jobs before SMTP; provider errors are never reported as delivery',async()=>{
 let claimed=false;const fetchImpl=async()=>{const ok=!claimed;claimed=true;return Response.json({ok})};
 const first=await run({fetchImpl});const replay=await run({fetchImpl});assert.equal(first.messages.length,1);assert.equal(replay.statusCode,409);assert.equal(replay.messages.length,0);
 const fail=await run({fails:true});assert.equal(fail.statusCode,502);assert(!JSON.stringify(fail.body).includes('SECRET'));assert.equal(fail.body.retrySafe,undefined);
});
test('SMTP readiness authenticates and verifies connection without sending; only pre-send configuration errors allow safe retry',async()=>{
 const ready=await run({method:'GET'});assert.equal(ready.statusCode,200);assert.equal(ready.messages.length,0);assert.equal(ready.calls.length,0);
 const missing=await run({settings:{...env,SMTP_PASSWORD:''}});assert.equal(missing.statusCode,503);assert.equal(missing.body.retrySafe,true);assert.equal(missing.calls.length,0);
 const connection=await run({method:'GET',verifyFails:true});assert.equal(connection.statusCode,503);assert(!JSON.stringify(connection.body).includes('SECRET'));
});
test('Google redirects never forward secret or accept untrusted hosts',async()=>{
 let count=0;const good=await run({fetchImpl:async(url,opts)=>{count++;if(count===1)return new Response('',{status:302,headers:{location:'https://script.googleusercontent.com/macros/echo?test=1'}});assert.equal(opts.method,'GET');assert.equal(opts.body,undefined);return Response.json({ok:true})}});assert.equal(good.statusCode,200);
 const bad=await run({fetchImpl:async()=>new Response('',{status:302,headers:{location:'https://evil.test/steal'}})});assert.equal(bad.statusCode,502);assert.equal(bad.calls.length,1);assert.equal(bad.messages.length,0);
});
test('authenticated readiness verifies SMTP without claiming a row or sending',async()=>{
 const r=await run({method:'GET'});assert.equal(r.statusCode,200);assert.equal(r.calls.length,0);assert.equal(r.messages.length,0);assert.equal(r.closed,1);
 const failed=await run({method:'GET',verifyFails:true});assert.equal(failed.statusCode,503);assert.equal(failed.body.retrySafe,true);assert(!JSON.stringify(failed.body).includes('SECRET'));
});
test('a denied or replayed Sheet claim never opens an SMTP send',async()=>{
 const r=await run({fetchImpl:async()=>new Response(JSON.stringify({ok:false}))});assert.equal(r.statusCode,409);assert.equal(r.messages.length,0);
 const failed=await run({fails:true});assert.equal(failed.statusCode,502);assert(!JSON.stringify(failed.body).includes('SECRET'));assert.equal(failed.body.retrySafe,undefined);
 const en=await run({body:{rowNumber:2,email:'qa@example.com',registeredAt:'2026-11-17T10:00:00.000Z',locale:'en-US'}});assert(en.messages[0].text.startsWith('Thank you.'));
});

test('readiness reports only fixed configuration and SMTP reason codes without values',async()=>{
 for(const [failure,code] of [['EAUTH','smtp_auth_failed'],['ETIMEDOUT','smtp_timeout'],['EDNS','smtp_dns_failed'],['CERT_HAS_EXPIRED','smtp_tls_failed'],['untrusted-secret-text','smtp_connection_failed']]){
  const r=await run({method:'GET',verifyFails:failure});assert.equal(r.body.code,code);assert(!JSON.stringify(r.body).includes('SECRET'));assert.equal(r.messages.length,0);
 }
});

test('read-only end-to-end readiness detects outdated receiver without sending or claiming',async()=>{
 const r=await run({method:'GET',url:'/api/welcome-email?receiver=1',fetchImpl:async(_url,opts)=>{assert.equal(JSON.parse(opts.body).action,'check-welcome-smtp');return new Response(JSON.stringify({ok:true}));}});
 assert.equal(r.statusCode,200);assert.equal(r.messages.length,0);assert.equal(r.calls.length,1);
 const old=await run({method:'GET',url:'/api/welcome-email?receiver=1',fetchImpl:async()=>new Response(JSON.stringify({ok:false}))});assert.equal(old.body.code,'receiver_not_ready');assert.equal(old.messages.length,0);
});

test('immediate-mode readiness probes the deployed immediate receiver without sending',async()=>{
 const r=await run({method:'GET',url:'/api/welcome-email?receiver=1&immediate=1',fetchImpl:async(_url,opts)=>{assert.equal(JSON.parse(opts.body).action,'check-welcome-immediate');return Response.json({ok:true})}});assert.equal(r.statusCode,200);assert.equal(r.messages.length,0);
});

test('immediate readiness identifies a legacy live receiver without sending or claiming',async()=>{
 const r=await run({method:'GET',url:'/api/welcome-email?receiver=1&immediate=1',fetchImpl:async(_url,opts)=>{const action=JSON.parse(opts.body).action;assert(['check-welcome-immediate','check-welcome-smtp'].includes(action));return Response.json({ok:action==='check-welcome-smtp'})}});assert.equal(r.statusCode,503);assert.equal(r.body.code,'receiver_version_outdated');assert.equal(r.messages.length,0);assert.equal(r.calls.length,2);
});
