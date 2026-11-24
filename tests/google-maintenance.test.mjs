import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,access,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const output=await mkdtemp('/tmp/primal-maintenance-');
execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,OUTPUT_DIR:output}});
after(()=>rm(output,{recursive:true,force:true}));
const load=file=>readFile(output+'/'+file,'utf8');
test('unknown nested routes retain usable 404 navigation and assets',async()=>{
 for(const file of ['404.html','en/404.html']){
  const html=await load(file);
  assert.match(html,/<script src="\/bootstrap.js"/);
  for(const [,url]of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^(?:https?:|mailto:|tel:|#|data:)/.test(url))continue;
   assert(url.startsWith('/'),`${file}: ${url}`);
  }
 }
});
test('sitemap discovers real images alongside the public canonical pages',async()=>{
 const sitemap=await load('sitemap.xml');
 assert.equal([...sitemap.matchAll(/<url>/g)].length,38);
 const images=[...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)];assert(images.length>0);
 for(const [,url]of images){assert.equal(new URL(url).origin,'https://primalcore.gr');await access(output+new URL(url).pathname)}
 assert(!sitemap.includes('<loc>https://primalcore.gr/thanks</loc>'));
});
test('all explicitly allowed crawler groups exclude operational endpoints',async()=>{
 const robots=await load('robots.txt');
 for(const group of robots.split(/\n\s*\n/).filter(g=>g.startsWith('User-agent:'))){assert(group.includes('Allow: /'));assert(group.includes('Disallow: /api/'));assert(group.includes('Disallow: /.netlify/functions/'));assert(!group.includes('Disallow: /assets'))}
});
test('home media prioritizes the responsive hero and defers offscreen film buffering',async()=>{
 for(const file of ['index.html','en/index.html']){
  const html=await load(file),video=html.match(/<video\b(?=[^>]*id="ingredient-video")[^>]*>/)[0];
  assert.match(video,/preload="none"/);assert(!video.includes('autoplay'));
  const preloads=[...html.matchAll(/<link\b(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/g)].map(m=>m[0]);
  assert.equal(preloads.length,2);assert(preloads.every(t=>t.includes('fetchpriority="high"')));
 }
});
