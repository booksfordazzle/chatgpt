import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access,readdir,mkdtemp,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {aiCrawlers,discoveryPages,homeContent,plainText} from '../scripts/geo.mjs';
import {canonicalPath} from '../site.config.mjs';

// Build once: assertions target deployable output, including source-derived content.
const output=await mkdtemp('/tmp/primal-geo-');
execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,OUTPUT_DIR:output}});
after(()=>rm(output,{recursive:true,force:true}));
const load=file=>readFile(output+'/'+file,'utf8');
const graph=html=>[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(([,s])=>{const d=JSON.parse(s);return d['@graph']||[d]});

test('AI discovery explicitly permits requested agents and advertises the actual sitemap',async()=>{
 const robots=await load('robots.txt');
 for(const bot of aiCrawlers){const group=robots.split(/\n\s*\n/).find(g=>g.startsWith(`User-agent: ${bot}\n`));assert(group?.includes('Allow: /'),bot)}
 assert(robots.trimEnd().endsWith('Sitemap: https://primalcore.gr/sitemap.xml'));
 const sitemap=await load('sitemap.xml');
 for(const relative of ['index.html','en/index.html','blog/index.html','en/blog/index.html',...discoveryPages]){
  assert(sitemap.includes(`<loc>https://primalcore.gr${canonicalPath(relative)}</loc>`),relative);
  assert.doesNotMatch(await load(relative),/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)/);
 }
 for(const relative of ['thanks.html','en/thanks.html','systatika.html','en/ingredients.html']){
  assert(!sitemap.includes(`<loc>https://primalcore.gr${canonicalPath(relative)}</loc>`));
  assert.match(await load(relative),/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)/);
 }
});

test('prelaunch homepages retain bilingual FAQ and brand schema without Product snippet markup',async()=>{
 for(const [relative,lang]of [['index.html','el'],['en/index.html','en']]){
  const html=await load(relative),nodes=graph(html),source=await readFile('public/'+relative,'utf8');
  for(const type of ['Organization','Brand','WebSite','WebPage','FAQPage'])assert.equal(nodes.filter(n=>n['@type']===type).length,1,type);
  assert.equal(nodes.find(n=>n['@type']==='WebPage').inLanguage,lang);
  const faq=nodes.find(n=>n['@type']==='FAQPage');assert.equal(faq.inLanguage,lang);
  assert.deepEqual(faq.mainEntity.map(q=>({title:q.name,text:q.acceptedAnswer.text})),homeContent(source).faq);
  assert(!nodes.some(n=>n['@type']==='Product'));
  assert(!JSON.stringify(nodes).includes('/#product'),'No dangling Product references');
  assert.equal(nodes.find(n=>n['@type']==='WebPage').about['@id'],'https://primalcore.gr/#organization');
  assert(!JSON.stringify(nodes).match(/\"(?:offers|price|aggregateRating|review)\"\s*:/),'No fabricated purchasing or review fields');
  await access('public'+new URL(nodes.find(n=>n['@type']==='Organization').logo.url).pathname);
  const body=s=>s.slice(s.indexOf('<body')).replace(/href="[^"]*"/g,'href=""');assert.equal(body(html),body(source),'Only pre-existing clean-route link rebasing may differ in the body');
 }
});

test('LLM Markdown includes every current bilingual benefit, ingredient and FAQ and only real local URLs',async()=>{
 const full=await load('llms-full.txt'),summary=await load('llms.txt');
 assert(summary.startsWith("# PRIMAL CORE — 5-Ingredient Men's Natural Face Balm (Beef Tallow & Chios Mastic)"));
 for(const relative of ['index.html','en/index.html']){
  const content=homeContent(await readFile('public/'+relative,'utf8'));
  for(const item of [...content.benefits,...content.ingredients,...content.faq])assert(full.includes(`### ${item.title}\n\n${item.text}`),item.title);
 }
 for(const [,url]of (summary+full).matchAll(/\]\((https:\/\/primalcore\.gr[^)]*)\)/g)){
  const pathname=new URL(url).pathname;
  await access(output+(pathname==='/'?'/index.html':pathname==='/en'?'/en/index.html':pathname.endsWith('.txt')||pathname.endsWith('.xml')?pathname:['/blog','/en/blog'].includes(pathname)?pathname+'/index.html':pathname+'.html'));
 }
 assert(!summary.includes('/history'));assert(!/<(?:div|svg|script|style)\b/.test(full));
 assert.equal(plainText('<h3>A &amp; B</h3><svg><path/></svg>'),'A & B');
});

test('all generated pages have parseable, unique global schema without changing their body',async()=>{
 async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await walk(p);else if(p.endsWith('.html')){
  const html=await readFile(p,'utf8'),nodes=graph(html);assert.equal(nodes.filter(n=>n['@type']==='Organization').length,1,p);assert.equal(new Set(nodes.map(n=>n['@id'])).size,nodes.length,p);
  const source=await readFile('public/'+p.slice(output.length+1),'utf8');
  // Navigation is rebased for clean routes by the pre-existing build; text must remain identical.
  assert.equal(plainText(html.slice(html.indexOf('<body'))),plainText(source.slice(source.indexOf('<body'))),p);
 }}}
 await walk(output);
});
