import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../netlify/functions/waitlist.mjs';
const env={GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/example/exec',WAITLIST_SHARED_SECRET:'test-only-secret'};
const event=(data={},extra={})=>({httpMethod:'POST',headers:{'content-type':'application/json',accept:'application/json',host:'primal.test',origin:'https://primal.test'},body:JSON.stringify({email:'person@example.com',consent:true,...data}),...extra});
test('sends consent and email to configured receiver; success requires confirmed storage',async()=>{
 let sent;const handler=createHandler({env,fetchImpl:async(url,options)=>{sent={url,body:JSON.parse(options.body)};return new Response(JSON.stringify({ok:true}))}});
 const result=await handler(event());assert.equal(result.statusCode,200);assert.deepEqual(JSON.parse(result.body),{ok:true});assert.equal(sent.body.email,'person@example.com');assert.equal(sent.body.token,env.WAITLIST_SHARED_SECRET);assert.equal(sent.body.consent,true);
});
test('invalid requests never reach the receiver',async()=>{
 let calls=0;const handler=createHandler({env,fetchImpl:async()=>{calls++;throw Error()}});
 for(const data of [{email:'invalid'},{email:'a\nb@example.com'},{consent:false},{website:'bot.example'},{email:'x'.repeat(255)+'@e.com'}])assert.equal((await handler(event(data))).statusCode,400);
 assert.equal((await handler(event({}, {body:'null'}))).statusCode,400);
 assert.equal((await handler(event({}, {body:'{bad'}))).statusCode,400);
 assert.equal(calls,0);
});
test('unconfigured form fails honestly',async()=>{const result=await createHandler({env:{}})(event());assert.equal(result.statusCode,503);assert.equal(JSON.parse(result.body).ok,false)});
test('rejects arbitrary endpoints and cross-origin requests',async()=>{
 const handler=createHandler({env:{...env,GOOGLE_APPS_SCRIPT_URL:'https://attacker.test/exec'}});assert.equal((await handler(event())).statusCode,503);
 assert.equal((await handler(event({}, {headers:{...event().headers,origin:'https://other.test'}}))).statusCode,403);
});
test('storage failures, HTML responses and transport errors cannot report success',async()=>{
 for(const fetchImpl of [async()=>new Response('{"ok":false}'),async()=>new Response('unavailable',{status:503}),async()=>new Response('<html>login</html>'),async()=>{throw Error('timeout')}]){
  const result=await createHandler({env,fetchImpl})(event());assert.equal(result.statusCode,502);assert.equal(JSON.parse(result.body).ok,false);
 }
});
test('supports native browser submission and rejects GET',async()=>{
 const handler=createHandler({env,fetchImpl:async()=>new Response('{"ok":true}')});
 const native=event({}, {headers:{'content-type':'application/x-www-form-urlencoded',accept:'text/html'},body:'email=person%40example.com&consent=true'});
 const result=await handler(native);assert.equal(result.statusCode,303);assert.equal(result.headers.Location,'/thanks.html');
 const unavailable=await createHandler({env:{}})(native);assert.equal(unavailable.headers.Location,'/signup-unavailable.html');
 assert.equal((await handler(event({}, {httpMethod:'GET'}))).statusCode,405);
});
