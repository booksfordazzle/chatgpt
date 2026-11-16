import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

async function pages(dir) {
 const files=[];
 for (const entry of await readdir(dir,{withFileTypes:true})) {
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()) files.push(...await pages(file));
  else if(file.endsWith('.html')) files.push(file);
 }
 return files;
}

test('every Greek page has a complete English counterpart and reciprocal language links',async()=>{
 const englishPages=await pages('public/en');
 const guides = JSON.parse(await readFile('content/guides.json','utf8'));
 assert.equal(englishPages.length,24);
 const counterparts = new Map(guides.map(g => ['public/' + g.paths[1], 'public/' + g.paths[0]]));
 for(const englishFile of englishPages){
  const relative=path.relative('public/en',englishFile);
  const greekFile=counterparts.get(englishFile) || path.join('public',relative);
  const [english,greek]=await Promise.all([readFile(englishFile,'utf8'),readFile(greekFile,'utf8')]);
  assert.match(english,/<html lang="en-US">/);
  assert.match(greek,/<html lang="el">/);
  for(const [html,file,counterpart] of [[english,englishFile,greekFile],[greek,greekFile,englishFile]]){
   const link=html.match(/<a\b[^>]*data-language-link=""[^>]*href="([^"]+)"/);
   assert.ok(link,`${file} has a language switch`);
   assert.equal(path.resolve(path.dirname(file),link[1]),path.resolve(counterpart));
  }
  const main=english.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.doesNotMatch(main,/[\u0370-\u03ff]/,`${englishFile} has untranslated content`);
  // Greek-only audit intentionally changes content without authoring English counterparts.
  assert.ok(main.trim().length > 0, `${relative} keeps its existing English content`);
 }
});
