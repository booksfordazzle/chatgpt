import test,{after}from'node:test';
import assert from'node:assert/strict';
import{mkdtemp,readFile,rm,readdir,access}from'node:fs/promises';
import{execFileSync}from'node:child_process';
import{plainText}from'../scripts/geo.mjs';
const out=await mkdtemp('/tmp/primal-editorial-');
execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,OUTPUT_DIR:out}});
after(()=>rm(out,{recursive:true,force:true}));
const load=f=>readFile(out+'/'+f,'utf8');
test('editorial schema reflects visible authorship, headline and actual edit date without invented publication or review',async()=>{
 for(const folder of ['blog','en/blog','odigos','en/guides'])for(const file of(await readdir(out+'/'+folder)).filter(f=>f.endsWith('.html')&&f!=='index.html')){
  const html=await load(folder+'/'+file),graph=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1])['@graph']);
  const articles=graph.filter(n=>n['@type']==='BlogPosting');assert.equal(articles.length,1);
  const a=articles[0];assert.equal(a.headline,plainText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]));
  assert.equal(a.dateModified,html.match(/class="note editorial-meta">[\s\S]*?<time datetime="([^"]+)"/)[1]);assert.equal(a.datePublished,undefined);assert.equal(a.reviewedBy,undefined);
  assert(graph.some(n=>n['@type']==='Organization'&&n['@id']===a.author['@id']));
  assert.equal(a.url,html.match(/<link rel="canonical" href="([^"]+)"/)[1]);assert.equal(a.mainEntityOfPage['@id'],a.url+'#webpage');
  assert(a.image.length>0);for(const image of a.image)await access(out+new URL(image).pathname);
  assert(html.includes('#ingredients'));assert(!graph.some(n=>n['@type']==='Product'));
 }
});
test('blog cards provide excerpts and retain explicit crawlable article destinations',async()=>{
 for(const f of['blog/index.html','en/blog/index.html']){
  const html=await load(f);assert(!html.includes('\"@type\":\"BlogPosting\"'),'The blog listing is not an individual article');const cards=[...html.matchAll(/<article>([\s\S]*?)<\/article>/g)];assert.equal(cards.length,14);
  for(const [,card]of cards){assert.match(card,/<a href="[^"]+">/);assert.match(card,/<h2>.+?<\/h2>/);assert(plainText(card.match(/<\/a><p>([\s\S]*?)<\/p>/)[1]).length>30)}
 }
});
test('history corrections remove unsupported outcome claims in both languages without changing noindex policy',async()=>{
 for(const f of ['blog/hippocrates-tallow-mastic.html','en/blog/hippocrates-tallow-mastic.html']){
  const html=await load(f);assert.match(html,/noindex,follow/);assert(!/σχεδόν ταυτόσημο|almost identical|Instantly soothes|Καταπραΰνει άμεσα|unchanged for months|αναλλοίωτη για μήνες/.test(html));assert(html.includes('https://www.ema.europa.eu/en/medicines/herbal/mastic'));assert(html.includes('https://ich.unesco.org/'));
 }
});
