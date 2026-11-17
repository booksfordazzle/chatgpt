import {mkdir,writeFile} from 'node:fs/promises';
import {welcomeHtml,welcomeAttachments} from '../server/welcome-template.mjs';
await mkdir('previews',{recursive:true});
for(const [locale,name] of [['el','welcome-el'],['en-US','welcome-en']]){
 let html=welcomeHtml(locale);
 for(const image of welcomeAttachments(locale))html=html.replaceAll('cid:'+image.cid,`data:${image.contentType};base64,${image.content.toString('base64')}`);
 await writeFile(`previews/${name}.html`,html);
}
console.log('Wrote self-contained previews/welcome-el.html and previews/welcome-en.html. No mail sent.');
