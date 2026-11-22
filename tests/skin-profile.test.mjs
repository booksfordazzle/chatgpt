import test from 'node:test';
import assert from 'node:assert/strict';
import {questions}from'../public/skin-profile/questions.mjs';
import {evaluate,validResult,validAnswer}from'../public/skin-profile/engine.mjs';
import {resultText,personalizedSummary}from'../public/skin-profile/content.mjs';
import {createSkinProfileHandler}from'../server/skin-profile.mjs';
const base=()=>[0,0,3,0,0,0,2,0,0,0];
test('all question options are accepted; unknown and incomplete answers are rejected',()=>{for(let q=0;q<10;q++)for(let option=0;option<questions[q].options.length;option++){const a=base();a[q]=option;assert(validResult(evaluate(a)));}for(const a of[[],Array(10),null,base().map(()=>99),base().map(()=>-1),base().map(()=>0.5)])assert.throws(()=>evaluate(a));});
test('five primary profiles and both independent comfort overrides follow the supplied mapping',()=>{for(const [i,p]of['M','A','M','C','B','E'].entries()){let a=base();a[3]=i;assert.equal(evaluate(a).primary,p);for(const [q,v]of[[1,3],[5,2]]){a=base();a[3]=i;a[q]=v;const r=evaluate(a);assert.equal(r.primary,'C');assert.equal(r.secondary,p==='C'?null:p);}}});
test('secondary priority excludes primary and follows original goal, moisture, lines, balance and essentials order',()=>{let a=base();a[3]=5;a[1]=1;a[4]=2;a[2]=1;a[9]=3;assert.equal(evaluate(a).secondary,'M');a[1]=0;assert.equal(evaluate(a).secondary,'A');a[4]=0;assert.equal(evaluate(a).secondary,'B');a[3]=0;a[2]=3;assert.equal(evaluate(a).secondary,'E');a[9]=0;assert.equal(evaluate(a).secondary,null);a[3]=1;a[1]=1;assert.equal(evaluate(a).secondary,'M');});
test('habits retain satisfied routines and never turn a result into a product purchase prescription',()=>{const a=base();a[6]=3;a[7]=3;a[8]=3;const r=evaluate(a);assert.deepEqual(r.habits,['cleanse','moisturize','sun','keep']);assert(resultText(r).includes('Η υπάρχουσα ρουτίνα σου σε καλύπτει'));assert(!resultText(r).includes('Αγόρασε'));});
const env={GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/test/exec',WAITLIST_SHARED_SECRET:'private-sheets',SKIN_PROFILE_RESEARCH_V2_ENABLED:'true',SKIN_PROFILE_EMAIL_ENABLED:'true',SMTP_HOST:'smtp-gr.securemail.pro',SMTP_PORT:'465',SMTP_USER:'hello@primalcore.gr',SMTP_PASSWORD:'private',SKIN_PROFILE_SUPABASE_URL:'https://test.supabase.co',SKIN_PROFILE_SUPABASE_SERVICE_ROLE_KEY:'private-db',SKIN_PROFILE_ANALYTICS_ENABLED:'true'};
const body={action:'email',email:'owned@example.com',result:evaluate(base()),adult:true,deliveryConsent:true};
async function run(data=body,options={}){const calls=[],messages=[];const handler=createSkinProfileHandler({env:options.env||env,limit:options.limit||(()=>({allowed:true})),fetchImpl:async(url,init)=>{calls.push({url,body:JSON.parse(init.body)});return Response.json(options.saved??(JSON.parse(init.body).action==='skin-research-v2'?{ok:true,spreadsheetId:'1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA',submissionId:JSON.parse(init.body).submissionId}:true));},createTransport:()=>({sendMail:async message=>{messages.push(message);return{accepted:options.reject?[]:[message.to]};},close(){}})});const res={setHeader(){},end(raw){this.data=JSON.parse(raw)}};await handler({method:options.method||'POST',headers:{host:'primal.test',origin:'https://primal.test','content-type':'application/json',...(options.headers||{})},body:data},res);return{...res,calls,messages};}
test('result delivery is explicit, HTML with a text alternative and never writes a marketing signup or quiz responses',async()=>{const r=await run();assert.equal(r.statusCode,200);assert.equal(r.calls.length,0);assert.equal(r.messages.length,1);assert(r.messages[0].html.includes('<html lang="el">'));assert.equal(r.messages[0].text,resultText(body.result));assert.equal(r.messages[0].subject,'PRIMAL CORE — Η σύνοψη της καθημερινής σου φροντίδας');assert.equal(r.messages[0].from.address,'hello@primalcore.gr');});
test('declined delivery consent, invalid email, injected content and cross-site requests cannot send mail',async()=>{for(const d of[{...body,deliveryConsent:false},{...body,adult:false},{...body,email:'a@b.com\nBcc:x@y.com'},{...body,answers:base()},{...body,result:{...body.result,html:'attacker'}},{...body,result:{primary:'X',secondary:null,habits:[]}}]){const r=await run(d);assert.equal(r.statusCode,400);assert.equal(r.messages.length,0);}const r=await run(body,{headers:{origin:'https://attacker.test'}});assert.equal(r.statusCode,403);assert.equal(r.messages.length,0);});
test('feature gates, rate limits and unconfirmed SMTP are reported honestly',async()=>{assert.equal((await run(body,{env:{}})).statusCode,503);assert.equal((await run(body,{limit:()=>({allowed:false,retryAfter:60})})).statusCode,429);assert.equal((await run(body,{reject:true})).statusCode,502);const caps=await run(null,{method:'GET',env:{}});assert.deepEqual(caps.data,{email:false,research:false,researchV2:false,analytics:false});});
test('market research writes independent aggregate categories without email or profile',async()=>{const r=await run({action:'research',consent:true,interest:1,spend:null,decision:3});assert.equal(r.statusCode,200);assert.deepEqual(r.calls[0].body,{entries:[{metric:'research:interest:1'},{metric:'research:decision:3'}]});assert.equal(r.messages.length,0);for(const d of[{action:'research',consent:false,interest:0,spend:null,decision:null},{action:'research',consent:true,interest:null,spend:null,decision:null},{action:'research',consent:true,interest:9,spend:null,decision:null},{action:'research',consent:true,interest:0,spend:null,decision:null,email:'person@example.com'}])assert.equal((await run(d)).statusCode,400);});
test('consent-aware events accept only an allowlisted name without payload, UTM or profile',async()=>{const r=await run({action:'event',name:'quiz_complete',consent:true});assert.deepEqual(r.calls[0].body,{entries:[{metric:'event:quiz_complete'}]});for(const d of[{action:'event',name:'quiz_complete',consent:false},{action:'event',name:'profile_C',consent:true},{action:'event',name:'quiz_complete',consent:true,result:body.result}])assert.equal((await run(d)).statusCode,400);assert.equal((await run({action:'event',name:'quiz_complete',consent:true},{saved:false})).statusCode,503);});

test('V2 research requires five complete answers and confirms Google Sheets storage',async()=>{
 const body={action:'research-v2',submissionId:'12345678-1234-4234-8234-123456789012',problem:7,routine:6,unmet:8,concept:6,price:6,consent:true};
 const r=await run(body);assert.equal(r.statusCode,200);assert.equal(r.messages.length,0);assert.equal(r.calls[0].body.action,'skin-research-v2');assert.equal(r.calls[0].body.spreadsheetId,'1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA');assert.equal(r.calls[0].body.submissionId,body.submissionId);assert.equal(r.calls[0].body.token,'private-sheets');
 for(const d of[{...body,price:7},{...body,unmet:9},{...body,problem:-1},{...body,concept:1.5},{...body,routine:undefined},{...body,email:'private@example.com'},{...body,result:evaluate(base())},{...body,consent:false},{...body,problem:null,routine:null,unmet:null,concept:null,price:null}]){const rejected=await run(d);assert.equal(rejected.statusCode,400);assert.equal(rejected.calls.length,0);}
 const partial=await run({...body,problem:null,routine:null,unmet:null,concept:null});assert.equal(partial.statusCode,400);assert.equal(partial.calls.length,0);
 assert.equal((await run(body,{env:{...env,SKIN_PROFILE_RESEARCH_V2_ENABLED:'false'}})).statusCode,503);
});

test('all 120 combinations of goal and strong discomfort signals route transparently to all five outcomes',()=>{
 const seen=new Set();let count=0;
 for(let wash=0;wash<5;wash++)for(let goal=0;goal<6;goal++)for(let tolerance=0;tolerance<4;tolerance++){
  const a=base();a[1]=wash;a[3]=goal;a[5]=tolerance;
  const expected=wash===3||tolerance===2?'C':['M','A','M','C','B','E'][goal];
  assert.equal(evaluate(a).primary,expected);seen.add(expected);count++;
 }
 assert.equal(count,120);assert.deepEqual([...seen].sort(),['A','B','C','E','M']);
});
test('occasional discomfort and age never force CALM; primary priority is stable across unrelated routine answers',()=>{
 for(let age=0;age<6;age++)for(let cleansing=0;cleansing<5;cleansing++)for(let moisture=0;moisture<4;moisture++)for(let sun=0;sun<4;sun++)for(let satisfaction=0;satisfaction<4;satisfaction++){
  const a=base();a[0]=age;a[5]=1;a[6]=cleansing;a[7]=moisture;a[8]=sun;a[9]=satisfaction;assert.equal(evaluate(a).primary,'M');
 }
});
test('personalized explanation names only the discomfort signals actually reported',()=>{
 const a=base();a[3]=3;let text=personalizedSummary(a).join(' ');assert(text.includes('προκύπτει από τη δική σου επιλογή'));assert(!text.includes('Ανέφερες κάψιμο'));
 a[3]=0;a[1]=3;text=personalizedSummary(a).join(' ');assert(text.includes('Ανέφερες κάψιμο ή τσούξιμο μετά το πλύσιμο'));assert(!text.includes('και συχνό κάψιμο'));
 a[1]=0;a[5]=2;text=personalizedSummary(a).join(' ');assert(text.includes('Ανέφερες συχνό κάψιμο ή ερεθισμό με νέα προϊόντα'));assert(!text.includes('Ανέφερες κάψιμο ή τσούξιμο μετά το πλύσιμο'));
 a[5]=1;assert(personalizedSummary(a).join(' ').includes('Η περιστασιακή ενόχληση μόνη της δεν αλλάζει'));
});
test('unknown sensations remain unknown and routine guidance follows the stated habits',()=>{
 const a=base();a[1]=4;a[2]=4;a[6]=2;a[7]=0;a[8]=0;let text=personalizedSummary(a).join(' ');assert(text.includes('Δεν έχω προσέξει'));assert(text.includes('Δεν είμαι σίγουρος/η'));assert(!text.includes('κοινό σαπούνι'));assert(!text.includes('Δοκίμασε μια συνεπή'));
 a[6]=1;a[7]=3;a[8]=3;text=personalizedSummary(a).join(' ');assert(text.includes('κοινό σαπούνι'));assert(text.includes('Δοκίμασε μια συνεπή'));assert(text.includes('δεν αφορά μόνο το καλοκαίρι'));
});

test('multiple selections accept only compatible sensations and cleansing habits',()=>{
 for(const value of [[1,3],[2,3],[1],[0],[4]])assert(validAnswer(value,1));
 for(const value of [[],Array(1),[0,3],[1,2],[4,1],[1,1],[1,2,3],[9],[-1]])assert(!validAnswer(value,1));
 for(const value of [[0,1,2,3],[0,2],[4]])assert(validAnswer(value,6));
 for(const value of [[],[4,0],[1,1],[5]])assert(!validAnswer(value,6));
 for(const index of [0,2,3,4,5,7,8,9])assert(!validAnswer([0],index));
});
test('combined sensations preserve comfort precedence and explain every selected sensation',()=>{
 const a=base();a[1]=[1,3];a[3]=4;a[6]=[0,2];const result=evaluate(a);assert.equal(result.primary,'C');assert(!result.habits.includes('cleanse'));const text=personalizedSummary(a).join(' ');assert(text.includes('Τραβάει · Κάψιμο ή τσούξιμο'));assert(text.includes('Ανέφερες κάψιμο ή τσούξιμο'));
 a[1]=[1];a[6]=[0,3];assert.equal(evaluate(a).primary,'B');assert(evaluate(a).habits.includes('cleanse'));
 a[1]=[0,3];assert.throws(()=>evaluate(a));
});
test('all compatible multi-select combinations preserve the declared priority rules',()=>{
 const selections=index=>Array.from({length:(1<<questions[index].options.length)-1},(_,n)=>questions[index].options.map((_,i)=>i).filter(i=>(n+1)&(1<<i))).filter(value=>validAnswer(value,index));
 const wash=selections(1),cleanse=selections(6);assert.equal(wash.length,7);assert.equal(cleanse.length,16);let checked=0;
 for(const sensation of wash)for(const cleansing of cleanse)for(let goal=0;goal<6;goal++)for(let tolerance=0;tolerance<4;tolerance++){
  const a=base();a[1]=sensation;a[6]=cleansing;a[3]=goal;a[5]=tolerance;
  const r=evaluate(a);assert.equal(r.primary,sensation.includes(3)||tolerance===2?'C':['M','A','M','C','B','E'][goal]);assert.equal(r.habits.includes('cleanse'),cleansing.some(v=>v===1||v===3));checked++;
 }assert.equal(checked,2688);
});

test('configured SMTP enables requested result delivery by default and explicit false disables it',async()=>{const configured={...env};delete configured.SKIN_PROFILE_EMAIL_ENABLED;assert.equal((await run(undefined,{env:configured,method:'GET'})).data.email,true);assert.equal((await run(undefined,{env:{...configured,SKIN_PROFILE_EMAIL_ENABLED:'false'},method:'GET'})).data.email,false);});
