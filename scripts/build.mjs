import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { discoveryPages, llmsFiles, structuredData } from './geo.mjs';
import { SITE_URL, SOCIAL_IMAGE, canonicalPath } from '../site.config.mjs';
const out = process.env.OUTPUT_DIR || 'dist';
await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true }); await cp('public', out, { recursive: true });
const measurementId=process.env.GA4_MEASUREMENT_ID||'';
if(measurementId&&!/^G-[A-Z0-9]{5,20}$/.test(measurementId))throw Error('Invalid GA4_MEASUREMENT_ID');
const verification=process.env.GOOGLE_SITE_VERIFICATION||'';
if(verification&&!/^[A-Za-z0-9_-]{10,200}$/.test(verification))throw Error('Invalid GOOGLE_SITE_VERIFICATION');
await writeFile(path.join(out,'analytics-config.js'),'window.PrimalAnalyticsConfig = '+JSON.stringify({measurementId})+';\n');
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const pages = [];
const pageImages = new Map();
const guides = JSON.parse(await readFile('content/guides.json', 'utf8'));
const reviewedPages = new Set(['index.html', 'en/index.html', 'blog/index.html', 'en/blog/index.html', ...discoveryPages, ...guides.filter(page => page.indexable).flatMap(page => page.paths)]);
async function visit(dir) {
 for (const entry of await readdir(dir, { withFileTypes: true })) {
  const file = path.join(dir,entry.name); if(entry.isDirectory()){await visit(file);continue;} if(!entry.name.endsWith('.html'))continue;
  const relative = path.relative(out,file).split(path.sep).join('/');
  const errorPage = relative === '404.html' || relative === 'en/404.html';
  const url = SITE_URL + canonicalPath(relative);
  let html = (await readFile(file,'utf8')).replaceAll('__SITE_URL__', SITE_URL);
  if(!html.includes('analytics-config.js')){const prefix='../'.repeat(relative.split('/').length-1);html=html.replace('<head>',`<head><script defer src="${prefix}analytics-config.js"></script><script defer src="${prefix}analytics.js"></script><link rel="stylesheet" href="${prefix}analytics.css">`);}
  if(verification)html=html.replace('</head>',`<meta name="google-site-verification" content="${verification}"></head>`);
  // The error document can be served at any requested depth. Its assets must
  // resolve from the site root, rather than from that nonexistent directory.
  if(errorPage)html=html.replace(/\b(href|src)="([^"]+)"/gi,(attribute,name,value)=>{
    if(value.startsWith('#'))return attribute;
    let target;try{target=new URL(value.replaceAll('&amp;','&'),SITE_URL+'/'+relative)}catch{return attribute}
    return target.origin===SITE_URL?`${name}="${escape(target.pathname+target.search+target.hash)}"`:attribute;
  });
  const readMeta = key => html.match(new RegExp('<meta\\b(?=[^>]*(?:property|name)="'+key+'")(?=[^>]*content="([^\"]+)")[^>]*>', 'i'))?.[1];
  const imageUrl = new URL(readMeta('og:image') || SOCIAL_IMAGE.path, SITE_URL);
  if (imageUrl.origin !== SITE_URL) throw new Error('Social images must use SITE_URL: ' + relative);
  const socialImage = { url: imageUrl.href, width: readMeta('og:image:width') || SOCIAL_IMAGE.width, height: readMeta('og:image:height') || SOCIAL_IMAGE.height, alt: readMeta('og:image:alt') || SOCIAL_IMAGE.alt };
  html = html.replace(/<link\b(?=[^>]*rel="canonical")[^>]*>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)="(?:og:url|og:image(?::(?:alt|width|height))?|twitter:image(?::alt)?)")[^>]*>/gi,'');
  const metadata = `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(socialImage.url)}"><meta property="og:image:width" content="${socialImage.width}"><meta property="og:image:height" content="${socialImage.height}"><meta property="og:image:alt" content="${escape(socialImage.alt)}"><meta name="twitter:image" content="${escape(socialImage.url)}"><meta name="twitter:image:alt" content="${escape(socialImage.alt)}">`;
  // Clean directory indexes such as /en and /blog have file-like URL bases.
  // Rebase relative navigation from the source filename to its published route.
  html = html.replace(/<a\b[^>]*href="([^"]+)"[^>]*>/gi, (tag, value) => {
    if (value.startsWith('#')) return tag;
    let target;
    try { target = new URL(value.replaceAll('&amp;', '&'), SITE_URL + '/' + relative); } catch { return tag; }
    if (target.origin !== SITE_URL) return tag;
    const destination = target.pathname.endsWith('.html') ? canonicalPath(target.pathname.slice(1)) : target.pathname.replace(/\/$/,'') || '/';
    const rebased = path.posix.relative(path.posix.dirname(canonicalPath(relative)), destination) || './';
    // './' and '..' can resolve to /en/ or /blog/, adding a redirect to the
    // canonical clean route. Use a root-relative destination in those cases.
    const candidate=rebased+target.search+target.hash;
    const href=errorPage||new URL(candidate,url).pathname!==destination?destination+target.search+target.hash:candidate;
    return tag.replace(/href="[^"]*"/, `href="${escape(href)}"`);
  });
  // Set progressive-enhancement state before first paint, preserving no-JS fallback.
  const bootstrap = errorPage ? '/bootstrap.js' : path.posix.relative(path.posix.dirname(canonicalPath(relative)), '/bootstrap.js') || 'bootstrap.js';
  html = html.replace('<head>', `<head><script src="${bootstrap}"></script>`);
  // Alternate-language metadata needs absolute canonical URLs (navigation stays relative).
  html = html.replace(/<link\b(?=[^>]*rel="alternate")(?=[^>]*hreflang=)[^>]*>/gi, tag => tag.replace(/href="([^"]+)"/, (_match, href) => {
    const target = new URL(href, SITE_URL + '/' + relative);
    return `href="${escape(SITE_URL + canonicalPath(target.pathname.slice(1)))}"`;
  }));
  // Default-language alternate matches the actual Greek counterpart, never the current English URL.
  const greekAlternate=html.match(/<link\b(?=[^>]*rel="alternate")(?=[^>]*hreflang="el")(?=[^>]*href="([^"]+)")[^>]*>/i)?.[1];
  if(greekAlternate&&!/hreflang="x-default"/i.test(html))html=html.replace('</head>',`<link rel="alternate" hreflang="x-default" href="${escape(greekAlternate)}"></head>`);
  html = html.replace('</head>',metadata+'</head>');
  // Explicitly requested public discovery pages become indexable; private/provisional pages retain noindex.
  if(discoveryPages.includes(relative))html=html.replace(/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)[^>]*>/gi,'');
  html = structuredData(html, relative, url);
  // Only reviewed complete pages are eligible; provisional ingredient declarations stay noindexed.
  if((reviewedPages.has(relative)||/^(?:en\/)?blog\/(?!index\.html$)[^/]+\.html$/.test(relative))&&!/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)/i.test(html)){
    pages.push(url);
    const images=new Set();
    for(const [tag] of html.matchAll(/<img\b[^>]*>/gi)){
      const src=tag.match(/\bsrc="([^"]+)"/)?.[1],alt=tag.match(/\balt="([^"]*)"/)?.[1];
      if(!src||!alt?.trim())continue;
      const image=new URL(src.replaceAll('&amp;','&'),SITE_URL+'/'+relative);
      if(image.origin!==SITE_URL||!image.pathname.startsWith('/assets/')||!image.pathname.match(/\.(?:jpe?g|png|webp|avif)$/i)||image.pathname.match(/\/(?:home-wordmark|audit-home-wordmark)\./))continue;
      images.add(image.href);
    }
    pageImages.set(url,[...images]);
  }
  await writeFile(file,html);
 }
}
await visit(out);
const robots=(await readFile('public/robots.txt','utf8')).replace(/^Sitemap:.*$/m,`Sitemap: ${SITE_URL}/sitemap.xml`);
await writeFile(path.join(out,'robots.txt'),robots);
const {summary,full}=llmsFiles(await readFile('public/index.html','utf8'),await readFile('public/en/index.html','utf8'));
await writeFile(path.join(out,'llms.txt'),summary);
await writeFile(path.join(out,'llms-full.txt'),full);
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+pages.map(url=>`<url><loc>${escape(url)}</loc>${(pageImages.get(url)||[]).map(image=>`<image:image><image:loc>${escape(image)}</image:loc></image:image>`).join('')}</url>`).join('')+'</urlset>');
console.log(`Built ${out}. Canonical target (not a claim of deployment): ${SITE_URL}; sitemap URLs: ${pages.length}`);
