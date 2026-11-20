import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {saveResearchToSheets,RESEARCH_SPREADSHEET_ID} from '../server/skin-research-sheets.mjs';
const submissionId='12345678-1234-4234-8234-123456789012';
const data={submissionId,problem:0,routine:1,unmet:2,concept:3,price:4,consent:true};
const env={GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/test/exec',WAITLIST_SHARED_SECRET:'secret'};
test('Sheets transport follows only the Google response redirect as a secret-free GET',async()=>{
 const calls=[];await saveResearchToSheets(data,{env,fetchImpl:async(url,options)=>{calls.push({url,options});return calls.length===1?new Response(null,{status:302,headers:{location:'https://script.googleusercontent.com/macros/echo?user_content_key=test'}}):Response.json({ok:true,spreadsheetId:RESEARCH_SPREADSHEET_ID,submissionId});}});
 assert.equal(calls[1].options.method,'GET');assert.equal(calls[1].options.body,undefined);assert.equal(calls[1].options.headers,undefined);
 for(const target of ['https://attacker.test/macros/echo','http://script.googleusercontent.com/macros/echo'])await assert.rejects(saveResearchToSheets(data,{env,fetchImpl:async()=>new Response(null,{status:302,headers:{location:target}})}));
});
test('Sheets transport rejects ambiguous acknowledgements and unconfigured destinations',async()=>{
 for(const result of [{ok:true},{ok:true,spreadsheetId:'wrong',submissionId},{ok:true,spreadsheetId:RESEARCH_SPREADSHEET_ID,submissionId:'wrong'},false])await assert.rejects(saveResearchToSheets(data,{env,fetchImpl:async()=>Response.json(result)}));
 await assert.rejects(saveResearchToSheets(data,{env:{...env,GOOGLE_APPS_SCRIPT_URL:'https://attacker.test/exec'},fetchImpl:()=>{throw Error('must not fetch');}}));
});
function receiver(initial=[],drop=false){const rows=structuredClone(initial);const sheet={getLastRow:()=>rows.length,getLastColumn:()=>rows[0]?.length||0,appendRow:r=>rows.push(Array.from(r)),setFrozenRows(){},getRange:(r,c,n,w)=>({getDisplayValues:()=>Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>String(rows[r+i-1]?.[c+j-1]??''))),setNumberFormat(){},setValues(values){if(drop)return;for(let i=0;i<values.length;i++){rows[r+i-1]??=[];for(let j=0;j<values[i].length;j++)rows[r+i-1][c+j-1]=values[i][j];}}})};const context={SpreadsheetApp:{openById(id){assert.equal(id,RESEARCH_SPREADSHEET_ID);return{getSheetByName(name){assert.equal(name,'Skin Research');return rows.length?sheet:null;},insertSheet(name){assert.equal(name,'Skin Research');return sheet;}}},flush(){}}};vm.createContext(context);vm.runInContext(readFileSync(new URL('../google-apps-script/SkinResearch.gs',import.meta.url),'utf8'),context);return{rows,save:input=>context.saveSkinResearch({action:'skin-research-v2',token:'secret',spreadsheetId:RESEARCH_SPREADSHEET_ID,...input})};}
test('Receiver records one readable row, verifies it, and deduplicates identical retries',()=>{const r=receiver();assert.equal(r.save(data).ok,true);assert.equal(r.rows.length,2);assert.equal(r.rows[1][3],'Ξηρότητα και αφυδάτωση');assert.equal(r.save(data).ok,true);assert.equal(r.rows.length,2);assert.equal(r.save({...data,price:5}).ok,false);assert.equal(r.rows.length,2);});
test('Receiver rejects incomplete answers, extra personal fields and wrong target without records',()=>{for(const input of [{...data,price:null},{...data,consent:false},{...data,email:'private@example.com'},{...data,spreadsheetId:'wrong'},{...data,submissionId:'invalid'}]){const r=receiver();assert.equal(r.save(input).ok,false);assert.equal(r.rows.length,0);}});
test('Receiver does not overwrite unknown layouts or acknowledge failed writes',()=>{const r=receiver([['Unrelated data']]);assert.equal(r.save(data).ok,false);assert.deepEqual(r.rows,[['Unrelated data']]);assert.equal(receiver([],true).save(data).ok,false);});

test('Shared receiver authenticates research before dispatch and releases its write lock',()=>{
 let writes=0,locked=false;
 const context={PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'secret'})},LockService:{getScriptLock:()=>({waitLock(){locked=true;},releaseLock(){locked=false;}})},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},saveSkinResearch(input){assert(locked);writes++;return{ok:true,spreadsheetId:RESEARCH_SPREADSHEET_ID,submissionId:input.submissionId};}};
 vm.createContext(context);vm.runInContext(readFileSync(new URL('../google-apps-script/Code.gs',import.meta.url),'utf8'),context);
 const send=token=>context.doPost({postData:{contents:JSON.stringify({action:'skin-research-v2',token,...data})}});
 assert.equal(send('wrong').ok,false);assert.equal(writes,0);assert.equal(send('secret').ok,true);assert.equal(writes,1);assert.equal(locked,false);
});
