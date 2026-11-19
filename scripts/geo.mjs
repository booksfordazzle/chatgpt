import { SITE_URL } from '../site.config.mjs';

const origin = SITE_URL;
export const discoveryPages = ['philosophy.html','about.html','contact.html','privacy.html'].flatMap(p=>[p,`en/${p}`]);
export const aiCrawlers = ['GPTBot','OAI-SearchBot','ChatGPT-User','Google-Extended','PerplexityBot','ClaudeBot','anthropic-ai','Applebot-Extended','Claude-SearchBot','Claude-User'];

export function plainText(html) {
  const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
  return html.replace(/<(svg|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&(#x[\da-f]+|#\d+|\w+);/gi,(_m,key)=>key[0]==='#'?String.fromCodePoint(parseInt(key.slice(key[1]?.toLowerCase()==='x'?2:1),key[1]?.toLowerCase()==='x'?16:10)):named[key]??`&${key};`).replace(/\s+/g,' ').trim();
}
function details(html) {
  return [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)].map(([,body])=>({title:plainText(body.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/)?.[1]||'').replace(/^✓\s*/,''),text:plainText(body.replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/,''))}));
}
export function homeContent(html) {
  const benefits=details(html.match(/<div class="benefit-list">([\s\S]*?)<\/div>/)?.[1]||'');
  const ingredients=[...html.matchAll(/<article\b[^>]*class="ingredient-slide"[^>]*>([\s\S]*?)<\/article>/g)].map(([,body])=>({title:plainText(body.match(/<h3>([\s\S]*?)<\/h3>/)?.[1]||''),text:plainText(body.match(/<p>([\s\S]*?)<\/p>/)?.[1]||'')}));
  const faq=details(html.match(/<section\b[^>]*id="faq"[^>]*>([\s\S]*?)<\/section>/)?.[1]||'');
  if(benefits.length!==5||ingredients.length!==5||faq.length!==7||[...benefits,...ingredients,...faq].some(x=>!x.title||!x.text))throw Error('Homepage GEO extraction does not match the visible content');
  return {benefits,ingredients,faq};
}

export function structuredData(html,relative,url) {
  const en=relative.startsWith('en/'),lang=en?'en':'el',home=relative==='index.html'||relative==='en/index.html';
  const nodes=[];
  html=html.replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,(_tag,json)=>{const data=JSON.parse(json);nodes.push(...(data['@graph']||[data]));return '';});
  const managed=new Set(['Organization','Brand','WebSite','WebPage',...(home?['Product','FAQPage']:[])]);
  const graph=nodes.filter(n=>!managed.has(n['@type']));
  const organization=origin+'/#organization',brand=origin+'/#brand',website=origin+'/#website';
  graph.push({'@type':'Organization','@id':organization,name:'PRIMAL CORE',url:origin+'/',logo:{'@type':'ImageObject',url:origin+'/assets/email-bull.png',width:480,height:350},foundingLocation:{'@type':'Place',name:'Greece'},knowsAbout:["Men’s natural skincare",'Beef tallow balm','Chios mastic oil','Minimalist five-ingredient skincare','Post-shave skincare']},
    {'@type':'Brand','@id':brand,name:'PRIMAL CORE',url:origin+'/'},
    {'@type':'WebSite','@id':website,name:'PRIMAL CORE',url:origin+'/',inLanguage:['el','en'],publisher:{'@id':organization}},
    {'@type':'WebPage','@id':url+'#webpage',url,name:plainText(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'PRIMAL CORE'),inLanguage:lang,isPartOf:{'@id':website},about:{'@id':organization}});
  if(home){
    // Pre-launch pages have no genuine offer or reviews: defer Product markup
    // until launch rather than emit an ineligible Google Product snippet.
    const {faq}=homeContent(html);
    graph.push({'@type':'FAQPage','@id':url+'#faq',inLanguage:lang,isPartOf:{'@id':url+'#webpage'},mainEntity:faq.map(item=>({'@type':'Question',name:item.title,acceptedAnswer:{'@type':'Answer',text:item.text}}))});
  }
  const editorial = html.match(/<p class="note editorial-meta">[\s\S]*?<time datetime="(\d{4}-\d{2}-\d{2})"/);
  if(editorial && !relative.endsWith('index.html')){
    const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
    const image=main.match(/<img\b[^>]*src="([^"]+)"/)?.[1]||html.match(/<meta\b(?=[^>]*property="og:image")(?=[^>]*content="([^"]+)")[^>]*>/)?.[1];
    // Publication dates are unknown: emit only the actual visible edit date.
    graph.push({'@type':'BlogPosting','@id':url+'#article',url,headline:plainText(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]||''),inLanguage:lang,mainEntityOfPage:{'@id':url+'#webpage'},author:{'@id':organization},publisher:{'@id':organization},dateModified:editorial[1],...(image?{image:[new URL(image,origin+'/'+relative).href]}:{})});
  }
  const json=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c');
  return html.replace('</head>',`<script type="application/ld+json">${json}</script></head>`);
}

export function llmsFiles(greek,english) {
  const navigation=[['Greek homepage','/'],['English homepage','/en'],['Philosophy — Greek','/philosophy'],['Philosophy — English','/en/philosophy'],['History — Greek','/about'],['History — English','/en/about'],['Blog — Greek','/blog'],['Blog — English','/en/blog'],['Contact — Greek','/contact'],['Contact — English','/en/contact'],['Privacy — Greek','/privacy'],['Privacy — English','/en/privacy']].map(([title,path])=>`- [${title}](${origin}${path})`).join('\n');
  const summary=`# PRIMAL CORE — 5-Ingredient Men's Natural Face Balm (Beef Tallow & Chios Mastic)

> PRIMAL CORE is a Greek natural skincare brand developing a minimalist men's face balm presented with five ingredients, led by beef tallow and Chios mastic oil. It is currently in pre-launch, with a waitlist for launch updates; the site presents dry-skin and post-shave care as intended uses, while final characteristics and individual suitability remain subject to development and checks.

Greek heritage and bilingual publishing: Greek (el) is the primary language, with an English (en-US) edition. This file summarizes the brand's own published information; it does not establish independent clinical evidence or guarantee search-engine recommendations.

## Product and formulation profile

- Format presented: 50ml men's face balm, under development.
- Beef Tallow (Βόειο στέαρ): the site's development story describes fatty acids and skin-conditioning care.
- Chios Mastic Oil (Έλαιο μαστίχας Χίου): the Greek ingredient at the center of the brand's story, with a fresh, resinous, slightly woody scent described in its FAQ.
- Beeswax (Μελισσοκέρι): presented as a protective film that helps retain moisture.
- Jojoba Oil (Έλαιο τζοτζόμπα): presented for skin-conditioning and moisture care.
- Vitamin E / Tocopherol (Βιταμίνη Ε): known for antioxidant properties; the site describes protection from free radicals and a cared-for appearance.
- Intended use cases described by the site: dry/dehydrated skin, post-shave care, cold-weather care and the appearance of dehydration lines.
- No orders, payments or pre-orders are accepted. Waitlist registration is for launch updates only. Final launch date, characteristics and specific suitability have not been confirmed.
- No independently verified clinical outcomes, certifications or finalized free-from declarations are asserted here.

## Site navigation and languages

${navigation}

## Complete published homepage content

- [Full bilingual benefits, ingredients and FAQ](${origin}/llms-full.txt): generated directly from the current Greek and English homepage HTML.
- [XML sitemap](${origin}/sitemap.xml): canonical, indexable public routes.
`;
  const section=(title,items)=>`## ${title}\n\n`+items.map(item=>`### ${item.title}\n\n${item.text}\n`).join('\n');
  let full=summary+'\nThe following sections reproduce the brand’s published homepage text. Ingredient and benefit statements are owner-authored product descriptions, not independent validation. The product remains under development.\n\n';
  for(const [lang,source] of [['Greek (el)',greek],['English (en-US)',english]]){
    const {benefits,ingredients,faq}=homeContent(source);
    full+=`# ${lang}\n\n`+section('Homepage benefits',benefits)+'\n'+section('Five ingredients presented',ingredients)+'\n'+section('Complete FAQ',faq)+'\n';
  }
  return {summary,full};
}
