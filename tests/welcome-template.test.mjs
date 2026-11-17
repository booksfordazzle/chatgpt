import test from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import {welcomeMessage} from '../server/welcome-email.mjs';
import {welcomeHtml,welcomeAttachments} from '../server/welcome-template.mjs';
test('bilingual welcome keeps accessible text, genuine destinations and inline assets without trackers or placeholders',()=>{
 for(const locale of ['el','en-US']){
  const html=welcomeHtml(locale),message=welcomeMessage('controlled@example.com',locale);
  assert(!html.includes('controlled@example.com'));assert(!/<script|<iframe|<form|{{|BECYCLE|DISCOVER NOW/.test(html));
  assert(html.includes('https://primalcore.gr/'));assert(html.includes('mailto:hello@primalcore.gr'));
  assert(html.includes(locale==='el'?'Πολιτική απορρήτου':'Privacy policy'));
  assert(html.includes(locale==='el'?'Καλώς ήρθες':'Welcome'));
  assert(message.text.includes(locale==='el'?'έτοιμο προς διάθεση':'ready to launch'));
  assert.equal(message.from.address,'hello@primalcore.gr');assert.equal(message.replyTo,'hello@primalcore.gr');
  for(const image of welcomeAttachments(locale)){assert(Buffer.isBuffer(image.content));assert(image.content.length>0);assert(html.includes('cid:'+image.cid));assert.equal(image.contentDisposition,'inline');}
  assert(!/<img[^>]+src="https?:/.test(html));assert(Buffer.byteLength(html)<20000);
 }
});
test('generated email is real multipart plain-text/HTML with both inline CID images; no SMTP send',async()=>{
 const transport=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'unix'});
 const {message}=await transport.sendMail(welcomeMessage('controlled@example.com','el'));
 const mime=message.toString();
 assert(mime.includes('multipart/alternative'));assert(mime.includes('multipart/related'));
 assert(mime.includes('Content-Type: text/plain'));assert(mime.includes('Content-Type: text/html'));
 for(const image of welcomeAttachments('el'))assert(mime.includes('Content-ID: <'+image.cid+'>'));
 transport.close();
});
