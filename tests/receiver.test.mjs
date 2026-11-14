import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../google-apps-script/Code.gs',import.meta.url),'utf8');
function receiver() {
 const rows=[];let locked=false,flushed=0;
 const sheet={getLastRow:()=>rows.length,appendRow:r=>rows.push(r),setFrozenRows:()=>{},getRange:(row,col,count)=>({getDisplayValues:()=>rows.slice(row-1,row-1+count).map(r=>[r[0].replace(/^'/,'')]),setNumberFormat:()=>{},setValues:values=>{assert.equal(locked,true);for(const value of values)rows.push(value)}})};
 const context={PropertiesService:{getScriptProperties:()=>({getProperty:key=>({WAITLIST_SHARED_SECRET:'test-secret',SPREADSHEET_ID:'test-sheet'})[key]})},LockService:{getScriptLock:()=>({waitLock:()=>{locked=true},releaseLock:()=>{locked=false}})},SpreadsheetApp:{openById:id=>{assert.equal(id,'test-sheet');return {getSheetByName:()=>rows.length?sheet:null,insertSheet:name=>{assert.equal(name,'Waitlist');return sheet}}},flush:()=>{flushed++}},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})}};
 vm.createContext(context);vm.runInContext(source,context);
 return {submit:data=>context.doPost({postData:{contents:JSON.stringify({token:'test-secret',consent:true,policyVersion:'2026-11-14',email:'person@example.com',...data})}}),rows,state:()=>({locked,flushed})};
}
test('Apps Script creates a dedicated sheet, writes consent and deduplicates',()=>{const r=receiver();assert.equal(r.submit({}).ok,true);assert.equal(r.rows.length,2);assert.equal(r.rows[1][0],"'person@example.com");assert.equal(r.rows[1][2],'true');assert.equal(r.submit({email:'PERSON@example.com'}).ok,true);assert.equal(r.rows.length,2);assert.equal(r.state().locked,false);assert.equal(r.state().flushed,1)});
test('Apps Script rejects invalid auth, consent and policy without writes',()=>{const r=receiver();for(const data of [{token:'wrong'},{consent:false},{policyVersion:'old'},{email:'invalid'}])assert.equal(r.submit(data).ok,false);assert.equal(r.rows.length,0)});
test('Apps Script escapes formula-like emails',()=>{const r=receiver();assert.equal(r.submit({email:'=formula@example.com'}).ok,true);assert.equal(r.rows[1][0],"'=formula@example.com");assert.equal(r.state().locked,false)});
