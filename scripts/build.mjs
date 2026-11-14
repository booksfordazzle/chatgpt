import { cp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
const out = process.env.OUTPUT_DIR || 'dist';
await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true }); await cp('public', out, { recursive: true });
const raw = process.env.SITE_URL || 'https://primalcore.gr';
let origin;
if (raw) { const url = new URL(raw); if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('SITE_URL must be an HTTPS origin, e.g. https://your-domain.gr'); origin = url.origin; }
const escape = s => s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const pages = [];
async function visit(dir) {
 for (const entry of await readdir(dir, { withFileTypes: true })) {
  const file = path.join(dir, entry.name); if (entry.isDirectory()) { await visit(file); continue; } if (!entry.name.endsWith('.html')) continue;
  const route = '/' + path.relative(out, file).split(path.sep).join('/').replace(/index\.html$/, '');
  let html = await readFile(file, 'utf8');
  if (origin && !html.includes('noindex, follow')) {
   const url = origin + route;
   html = html.replace('</head>', `<link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(origin)}/assets/product-mastic.jpg"><meta property="og:image:alt" content="PRIMAL CORE face balm"><meta name="twitter:image" content="${escape(origin)}/assets/product-mastic.jpg"></head>`);
   pages.push(url);
  }
  await writeFile(file, html);
 }
}
await visit(out);
await writeFile(path.join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''));
if (origin) await writeFile(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(url=>`<url><loc>${escape(url)}</loc></url>`).join('')+'</urlset>');
console.log(`Built ${out}. ${origin ? `Canonical origin: ${origin}` : 'Set SITE_URL before production deployment to generate canonical URLs, social images and sitemap.'}`);
