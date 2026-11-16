import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { SITE_URL, SOCIAL_IMAGE, canonicalPath } from '../site.config.mjs';
const out = process.env.OUTPUT_DIR || 'dist';
await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true }); await cp('public', out, { recursive: true });
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const pages = [];
async function visit(dir) {
 for (const entry of await readdir(dir, { withFileTypes: true })) {
  const file = path.join(dir,entry.name); if(entry.isDirectory()){await visit(file);continue;} if(!entry.name.endsWith('.html'))continue;
  const relative = path.relative(out,file).split(path.sep).join('/');
  const url = SITE_URL + canonicalPath(relative);
  let html = (await readFile(file,'utf8')).replaceAll('__SITE_URL__', SITE_URL);
  html = html.replace(/<link\b(?=[^>]*rel="canonical")[^>]*>/gi,'').replace(/<meta\b(?=[^>]*(?:name|property)="(?:og:url|og:image(?::(?:alt|width|height))?|twitter:image(?::alt)?)")[^>]*>/gi,'');
  const metadata = `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(SITE_URL+SOCIAL_IMAGE.path)}"><meta property="og:image:width" content="${SOCIAL_IMAGE.width}"><meta property="og:image:height" content="${SOCIAL_IMAGE.height}"><meta property="og:image:alt" content="${escape(SOCIAL_IMAGE.alt)}"><meta name="twitter:image" content="${escape(SITE_URL+SOCIAL_IMAGE.path)}"><meta name="twitter:image:alt" content="${escape(SOCIAL_IMAGE.alt)}">`;
  // Clean directory indexes such as /en and /blog have file-like URL bases.
  // Rebase relative navigation from the source filename to its published route.
  html = html.replace(/<a\b[^>]*href="([^"]+)"[^>]*>/gi, (tag, value) => {
    if (value.startsWith('#')) return tag;
    let target;
    try { target = new URL(value.replaceAll('&amp;', '&'), SITE_URL + '/' + relative); } catch { return tag; }
    if (target.origin !== SITE_URL) return tag;
    const destination = target.pathname.endsWith('.html') ? canonicalPath(target.pathname.slice(1)) : target.pathname;
    const rebased = path.posix.relative(path.posix.dirname(canonicalPath(relative)), destination) || './';
    return tag.replace(/href="[^"]*"/, `href="${escape(rebased + target.search + target.hash)}"`);
  });
  // Set progressive-enhancement state before first paint, preserving no-JS fallback.
  const bootstrap = path.posix.relative(path.posix.dirname(canonicalPath(relative)), '/bootstrap.js') || 'bootstrap.js';
  html = html.replace('<head>', `<head><script src="${bootstrap}"></script>`);
  // Alternate-language metadata needs absolute canonical URLs (navigation stays relative).
  html = html.replace(/<link\b(?=[^>]*rel="alternate")(?=[^>]*hreflang=)[^>]*>/gi, tag => tag.replace(/href="([^"]+)"/, (_match, href) => {
    const target = new URL(href, SITE_URL + '/' + relative);
    return `href="${escape(SITE_URL + canonicalPath(target.pathname.slice(1)))}"`;
  }));
  html = html.replace('</head>',metadata+'</head>');
  // Only the reviewed Greek landing page is ready for the production sitemap.
  if(relative==='index.html'&&!/<meta\b(?=[^>]*name="robots")(?=[^>]*content="[^"]*noindex)/i.test(html))pages.push(url);
  await writeFile(file,html);
 }
}
await visit(out);
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(url=>`<url><loc>${escape(url)}</loc></url>`).join('')+'</urlset>');
console.log(`Built ${out}. Canonical target (not a claim of deployment): ${SITE_URL}; sitemap URLs: ${pages.length}`);
