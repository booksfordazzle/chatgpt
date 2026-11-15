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
 assert.equal(englishPages.length,17);
 for(const englishFile of englishPages){
  const relative=path.relative('public/en',englishFile);
  const greekFile=path.join('public',relative);
  const [english,greek]=await Promise.all([readFile(englishFile,'utf8'),readFile(greekFile,'utf8')]);
  assert.match(english,/<html lang="en">/);
  assert.match(greek,/<html lang="el">/);
  for(const [html,file,counterpart] of [[english,englishFile,greekFile],[greek,greekFile,englishFile]]){
   const link=html.match(/<a data-language-link="" href="([^"]+)"/);
   assert.ok(link,`${file} has a language switch`);
   assert.equal(path.resolve(path.dirname(file),link[1]),path.resolve(counterpart));
  }
  const main=english.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.doesNotMatch(main,/[\u0370-\u03ff]/,`${englishFile} has untranslated content`);
  const sourceMain=greek.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal((main.match(/<p\b/g)||[]).length,(sourceMain.match(/<p\b/g)||[]).length,`${relative} retains all paragraphs`);
 }
});
