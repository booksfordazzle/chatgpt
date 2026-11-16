import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
async function htmlFiles(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await htmlFiles(p));else if(p.endsWith('.html'))out.push(p)}return out}
test('downloaded HTML resolves navigation and media relative to each file',async()=>{
 for(const file of await htmlFiles('public')){
  const html=await readFile(file,'utf8');
  for(const match of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)){
   const url=match[1];if(/^(https?:|mailto:|#)/.test(url))continue;
   assert.ok(!url.startsWith('/'),`${file} uses a server-root path: ${url}`);
   await access(path.resolve(path.dirname(file),url.split(/[?#]/)[0]));
  }
 }
 const css=await readFile('public/styles.css','utf8');
 for(const match of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g)){
  assert.ok(!match[1].startsWith('/'),'Font URL must also work from a local file');await access(path.resolve('public',match[1]));
 }
});
test('top-level index opens the bundled site',async()=>{assert.match(await readFile('index.html','utf8'),/url=public\/index.html/);await access('public/index.html')});
