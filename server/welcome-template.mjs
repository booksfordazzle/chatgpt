import { readFileSync } from 'node:fs';
const images = [
  { filename:'primal-core-bull.png', path:new URL('../public/assets/email-bull.png',import.meta.url), cid:'primal-core-bull', contentType:'image/png' },
  { filename:'primal-core-product.jpg', path:new URL('../public/assets/product-gallery-1-1.jpg',import.meta.url), cid:'primal-core-product', contentType:'image/jpeg' }
];
const imageContents = new Map();
export function welcomeAttachments(locale='el') {
  const lang=locale==='en-US'?'en':'el';
  const selected=[...images,{filename:`welcome-${lang}.png`,path:new URL(`../public/assets/email-welcome-${lang}.png`,import.meta.url),cid:`primal-core-welcome-${lang}`,contentType:'image/png'}];
  return selected.map(image=>{
    if(!imageContents.has(image.cid))imageContents.set(image.cid,readFileSync(image.path));
    return {filename:image.filename,content:imageContents.get(image.cid),cid:image.cid,contentType:image.contentType,contentDisposition:'inline'};
  });
}
export function welcomeHtml(locale) {
  const en=locale==='en-US';
  const home=en?'https://primalcore.gr/en':'https://primalcore.gr/';
  const privacy=en?'https://primalcore.gr/en/privacy':'https://primalcore.gr/privacy';
  const heading=en?'Welcome':'Καλώς ήρθες';
  const message=en?'You’ll receive a message when PRIMAL CORE is ready to launch.':'Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.';
  const preheader=en?'You’re on the PRIMAL CORE waitlist. Welcome.':'Μπήκες στη λίστα αναμονής του PRIMAL CORE. Καλώς ήρθες.';
  const cta=en?'Discover PRIMAL CORE':'Γνώρισε το PRIMAL CORE';
  const alt=en?'The PRIMAL CORE closed black tin in dramatic light':'Το κλειστό μαύρο δοχείο PRIMAL CORE σε δραματικό φωτισμό';
  return `<!doctype html>
<html lang="${en?'en-US':'el'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>PRIMAL CORE — ${en?'Welcome':'Καλώς ήρθες'}</title>
<style>@font-face{font-family:'Google Sans';src:url('https://primalcore.gr/assets/GoogleSans.woff2') format('woff2');font-style:normal;font-weight:400 700;font-display:swap}html,body{margin:0!important;padding:0!important;width:100%!important;background:#000000}table{border-collapse:collapse}img{border:0;outline:none;text-decoration:none}a{color:#f1f0e9}a:focus-visible{outline:2px solid #fff;outline-offset:4px}@media only screen and (max-width:620px){.email-shell{width:100%!important}.email-pad{padding-left:24px!important;padding-right:24px!important}.email-title{font-size:36px!important;line-height:1.13!important}.email-top{padding-top:40px!important}.email-bottom{padding-bottom:40px!important}.email-cta{display:block!important;padding-left:12px!important;padding-right:12px!important}}@media only screen and (max-width:360px){.email-title{font-size:30px!important}.email-pad{padding-left:20px!important;padding-right:20px!important}}</style><!--[if mso]><style>body,table,td,p,h1,a{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]--></head>
<body style="margin:0;padding:0;background-color:#000000;color:#f1f0e9;font-family:'Google Sans',Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;" aria-hidden="true">${preheader}</div>
<table role="presentation" width="100%" bgcolor="#000000" style="width:100%;background-color:#000000;"><tr><td align="center" valign="top">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" class="email-shell" width="600" style="width:100%;max-width:600px;background-color:#000000;" bgcolor="#000000">
<tr><td class="email-pad email-top" align="center" style="padding:48px 36px 0;"><img src="cid:primal-core-bull" alt="PRIMAL CORE" width="160" height="117" style="display:block;width:160px;max-width:100%;height:auto;margin:0 auto;"></td></tr>
<tr><td class="email-pad" align="center" style="padding:32px 36px 0;"><h1 class="email-title" style="margin:0;font-family:'Google Sans',Arial,Helvetica,sans-serif;font-size:48px;font-weight:400;line-height:1.12;letter-spacing:-1px;color:#f1f0e9;"><img src="cid:primal-core-welcome-${en?'en':'el'}" alt="${heading}" width="360" height="76" style="display:block;width:360px;max-width:100%;height:auto;margin:0 auto;font-family:'Google Sans',Arial,Helvetica,sans-serif;color:#f1f0e9;"></h1></td></tr>
<tr><td style="padding:40px 0 0;"><img src="cid:primal-core-product" alt="${alt}" width="600" style="display:block;width:100%;max-width:600px;height:auto;color:#f1f0e9;font-size:15px;"></td></tr>
<tr><td class="email-pad" align="center" style="padding:42px 48px 0;"><p style="margin:0;font-family:'Google Sans',Arial,Helvetica,sans-serif;font-size:20px;line-height:1.6;color:#f1f0e9;">${message}</p></td></tr>
<tr><td class="email-pad" align="center" style="padding:30px 48px 0;"><table role="presentation" width="100%" style="width:100%;max-width:360px;"><tr><td align="center" style="border:1px solid #f1f0e9;mso-padding-alt:16px 24px;"><a class="email-cta" href="${home}" style="display:block;padding:16px 24px;font-size:16px;line-height:24px;color:#f1f0e9;text-decoration:none;text-align:center;">${cta}</a></td></tr></table></td></tr>
<tr><td class="email-pad" align="center" style="padding:26px 48px 0;"><p style="margin:0;font-size:13px;line-height:21px;color:#b4b5ae;">${en?'Product under development.':'Το προϊόν βρίσκεται σε ανάπτυξη.'}</p></td></tr>
<tr><td class="email-pad email-bottom" style="padding:48px 48px 56px;"><table role="presentation" width="100%" style="width:100%;"><tr><td style="border-top:1px solid #3b3d37;padding-top:26px;text-align:center;">
<p style="margin:0 0 12px;font-size:13px;line-height:21px;color:#b4b5ae;">${en?'You joined the PRIMAL CORE launch updates list.':'Εγγράφηκες στη λίστα ενημερώσεων του PRIMAL CORE.'}</p>
<p style="margin:0 0 18px;font-size:13px;line-height:21px;color:#b4b5ae;">${en?'To stop receiving updates,':'Αν δεν θέλεις να λαμβάνεις ενημερώσεις,'}<br><a href="mailto:hello@primalcore.gr?subject=${en?'Unsubscribe%20from%20PRIMAL%20CORE':'%CE%94%CE%B9%CE%B1%CE%B3%CF%81%CE%B1%CF%86%CE%AE%20PRIMAL%20CORE'}" style="color:#f1f0e9;text-decoration:underline;">${en?'reply to this email.':'απάντησε σε αυτό το email.'}</a></p>
<p style="margin:0 0 18px;font-size:13px;line-height:21px;"><a href="${privacy}" style="color:#b4b5ae;text-decoration:underline;">${en?'Privacy policy':'Πολιτική απορρήτου'}</a> &nbsp;·&nbsp; <a href="mailto:hello@primalcore.gr" style="color:#b4b5ae;text-decoration:underline;">hello@primalcore.gr</a></p>
<p style="margin:0;font-size:12px;line-height:20px;color:#b4b5ae;">MMTX E.E<br>${en?'12 Filikis Etaireias Street':'Φιλικής Εταιρείας 12'}</p>
</td></tr></table></td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}
