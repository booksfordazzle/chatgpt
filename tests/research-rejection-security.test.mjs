import test from 'node:test';
import assert from 'node:assert/strict';
import {createSkinProfileHandler} from '../server/skin-profile.mjs';

const ID='0187e0b4-a4bb-44b4-8504-8c996570f875';
const env={
 SKIN_PROFILE_RESEARCH_SCRIPT_URL:'https://script.google.com/macros/s/TEST/exec',
 SKIN_PROFILE_RESEARCH_SECRET:'test-secret',
 SKIN_PROFILE_RESEARCH_V2_ENABLED:'true'
};
const payload=(price,reason)=>({action:'research-v2',submissionId:ID,consent:true,problem:0,routine:0,unmet:0,concept:0,price,reason});
async function submit(body,fetchImpl){
 const handler=createSkinProfileHandler({env,fetchImpl});
 let status,output;
 const req={method:'POST',headers:{origin:'https://primalcore.gr',host:'primalcore.gr','content-type':'application/json'},body};
 const res={setHeader(){},end(v){output=JSON.parse(v)},set statusCode(v){status=v},get statusCode(){return status}};
 await handler(req,res);
 return {status,output};
}
test('rejection option 6 requires a reason and preserves other answers',async()=>{
 let sent;
 const fetchImpl=async(_url,options)=>{sent=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({ok:true,spreadsheetId:'1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA',submissionId:ID})}};
 const ok=await submit(payload(6,2),fetchImpl);
 assert.equal(ok.status,200);
 assert.equal(sent.reason,2);
 assert.equal(sent.price,6);
 assert.equal(sent.problem,0);
});
test('rejection without reason fails closed',async()=>{
 let called=false;
 const response=await submit(payload(6,null),async()=>{called=true;throw Error('should not call')});
 assert.equal(response.status,400);
 assert.equal(called,false);
});
test('non-rejection must not submit a reason',async()=>{
 const response=await submit(payload(5,0),async()=>{throw Error('should not call')});
 assert.equal(response.status,400);
});
test('cross-site origin is rejected',async()=>{
 const handler=createSkinProfileHandler({env,fetchImpl:async()=>{throw Error('should not call')}});
 let code;const req={method:'POST',headers:{origin:'https://attacker.example',host:'primalcore.gr','content-type':'application/json'},body:payload(6,0)};
 await handler(req,{setHeader(){},end(){},set statusCode(v){code=v}});
 assert.equal(code,403);
});
