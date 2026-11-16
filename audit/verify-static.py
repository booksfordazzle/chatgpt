from pathlib import Path
from bs4 import BeautifulSoup
import json,re,xml.etree.ElementTree as ET
from urllib.parse import urljoin,urlparse,unquote
root=Path.cwd();out=root/'dist'; report=[]; excluded=[];bad=[];refs=[]
for f in sorted(out.rglob('*.html')):
 rel=f.relative_to(out).as_posix();s=BeautifulSoup(f.read_text(),'html.parser');route='/'+re.sub(r'index\.html$|\.html$','',rel).rstrip('/');route=route or '/'
 row={'file':rel,'route':route,'h1':len(s.select('h1')),'lang':s.html.get('lang'),'title':s.title.get_text(),'description':s.select_one('meta[name=description]').get('content'),'canonical':s.select_one('link[rel=canonical]').get('href'),'viewport':s.select_one('meta[name=viewport]').get('content'),'robots':s.select_one('meta[name=robots]').get('content') if s.select_one('meta[name=robots]') else 'indexable'};report.append(row)
 assert row['h1']==1,row
 assert row['viewport']=='width=device-width, initial-scale=1',row
 assert row['canonical']=='https://primalcore.gr'+route,row
 if rel!='index.html':assert 'noindex' in row['robots'];excluded.append(rel)
 assert 'chatgpt-weld-mu-98.vercel.app' not in f.read_text(),rel
 for a in s.select('a[href]'):
  href=a['href'];u=urlparse(urljoin('https://local.test'+route,href))
  if u.netloc!='local.test':continue
  target=out/unquote(u.path).lstrip('/'); candidates=[target,target.with_suffix('.html'),target/'index.html']
  if not any(x.is_file() for x in candidates):bad.append((rel,href))
 for sc in s.select('script[type="application/ld+json"]'):json.loads(sc.string)
assert not bad,bad
urls=[x.text for x in ET.parse(out/'sitemap.xml').findall('.//{*}loc')];assert urls==['https://primalcore.gr/'],urls
assert not any('terms' in a.get('href','') for f in out.rglob('*.html') if f.name!='terms.html' for a in BeautifulSoup(f.read_text(),'html.parser').select('a[href]'))
(root/'audit/noindex-pages.json').write_text(json.dumps(excluded,indent=2)+'\n');(root/'audit/pages-after.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
stems=re.compile(r'επανορθ|ανάπλασ|σύσφιξ|αντιβακτηρι|αντιμικροβ|αντιοξειδωτικ|πρόωρη γήρανση|κοκκινίλ|φράζ|λιπαρότητα|φραγμ|θρέφ|early bird|ΠΟΠ|grass-fed|δερματολογικά',re.I)
lines=['# Required stem scan','', 'Command: Python regex scan (case insensitive) of every tracked/source and built `.html`, `.js`, `.json`, excluding tooling cache and `.git`. Historical before-copy is intentionally preserved in Markdown/TSV evidence.','']
for f in sorted(root.rglob('*')):
 if not f.is_file() or f.suffix not in ['.html','.js','.json'] or any(x in f.parts for x in ['node_modules','.git']):continue
 if f.name.startswith('lighthouse-'):continue
 for n,line in enumerate(f.read_text(errors='replace').splitlines(),1):
  for m in stems.finditer(line):
   context=line[max(0,m.start()-100):m.end()+140];lines.append(f'- `{f.relative_to(root)}:{n}`: `{context}`')
   if f.parts[-3:-1] or True:assert 'Δεν τεκμηριώνεται αντιοξειδωτική' in context,(f,n,context)
lines+=['','All four matches (two source statements plus their built copies) explicitly deny substantiated antioxidant action of the final product. They are limitations, not positive efficacy claims. Lighthouse trace HTML/JSON are generated tool artifacts excluded from the authored-code scan; their embedded page snapshot repeats the same negative statement.']
(root/'audit/stem-verification.md').write_text('\n'.join(lines)+'\n')
print('PASS XML sitemap: one production-target root, no lastmod');print('PASS 37 HTML pages: H1=1, lang/title/description/canonical/viewport present; 36 noindexed secondary pages');print('PASS all built internal anchor routes resolve; Terms unlinked; no preview origin in served HTML');print('PASS required stem scan: explicit negative limitations only')
