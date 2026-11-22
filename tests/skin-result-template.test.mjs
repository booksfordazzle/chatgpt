import test from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import {skinResultHtml,skinResultAttachments} from '../server/skin-result-template.mjs';
import {identities,disclaimer,resultText} from '../public/skin-profile/content.mjs';
test('all five fixed result layouts retain guidance, disclaimers and no tracking',()=>{
 for(const primary of Object.keys(identities)){
  const html=skinResultHtml({primary,secondary:null,habits:['sun','keep']});
  for(const text of [identities[primary].title,identities[primary].subtitle,disclaimer,'Πρωί','Βράδυ','Συστατικά','Οι καθημερινές σου συνήθειες'])assert(html.includes(text));
  assert(!/<script|<form|[?]|<iframe|onload=|onerror=/i.test(html));
  assert(html.includes('role="presentation"'));assert(html.includes('max-width:600px'));
 }
 assert.throws(()=>skinResultHtml({primary:'<script>',secondary:null,habits:[]}));
});
test('result email MIME includes HTML and the unchanged plain-text alternative',async()=>{
 const result={primary:'B',secondary:null,habits:[]};
 const transport=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'});
 const message=await transport.sendMail({from:'hello@primalcore.gr',to:'example@example.com',subject:'Result',text:resultText(result),html:skinResultHtml(result),attachments:skinResultAttachments()});
 const raw=message.message.toString();
 assert.match(raw,/multipart\/alternative/);assert.match(raw,/Content-Type: text\/plain; charset=utf-8/);assert.match(raw,/Content-Type: text\/html; charset=utf-8/);assert.match(raw,/multipart\/related/);assert.match(raw,/Content-ID: <primal-result-bull>/);assert(!raw.includes('multipart/mixed'));transport.close();
});
