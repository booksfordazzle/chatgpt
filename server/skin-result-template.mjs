import {readFileSync} from 'node:fs';
import {identities,profiles,resultStories,habits,disclaimer} from '../public/skin-profile/content.mjs';
import {validResult} from '../public/skin-profile/engine.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs=items=>items.map(text=>`<p style="margin:0 0 18px;color:#d5d3cb;font-size:16px;line-height:1.7">${escape(text)}</p>`).join('');
const section=(title,items)=>`<tr><td class="content" style="padding:36px 36px 0;border-top:1px solid #33332f"><h2 style="margin:0 0 24px;font-size:23px;line-height:1.3;font-weight:500;color:#e3e0d5">${escape(title)}</h2>${paragraphs(items)}</td></tr>`;
// Presentation only: all copy comes from the existing fixed result catalogue.
// No recipient, raw answers, tracking pixel, analytics script or query tokens.
export function skinResultHtml(result){
 if(!validResult(result))throw Error('invalid_result');
 const identity=identities[result.primary],profile=profiles[result.primary],story=resultStories[result.primary];
 return `<!doctype html><html lang="el"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>PRIMAL CORE — ${escape(identity.title)}</title><style>@media(max-width:600px){.content{padding-left:24px!important;padding-right:24px!important}.result-title{font-size:44px!important}}a:focus{outline:2px solid #e3e0d5;outline-offset:4px}</style></head>
<body style="margin:0;padding:0;background:#080808;color:#e3e0d5;font-family:'Google Sans',Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escape(identity.title+' — '+identity.subtitle)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#080808"><tr><td align="center" style="padding:32px 0"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#0d0d0c">
<tr><td align="center" style="padding:36px 24px 28px"><a href="https://primalcore.gr/" style="color:#e3e0d5;text-decoration:none"><img src="cid:primal-result-bull" width="88" height="64" alt="PRIMAL CORE" style="display:block;border:0;width:88px;height:64px"></a></td></tr>
<tr><td class="content" style="padding:0 36px 32px"><h1 class="result-title" style="margin:0 0 20px;font-size:58px;font-weight:500;line-height:1.05;letter-spacing:-1px">${escape(identity.title)}</h1><p style="margin:0 0 28px;font-size:25px;line-height:1.35;color:#e3e0d5">${escape(identity.subtitle)}</p>${paragraphs([identity.intro,profile.reason])}</td></tr>
${section('Γενική ενημέρωση — όχι διάγνωση αιτίας',story.explanation)}
${section(story.actionTitle,story.actions)}
${section('Τι μπορείς να περιμένεις;',story.expectations)}
${section('Πρωί',profile.morning)}${section('Βράδυ',profile.evening)}
${section('Συστατικά',profile.ingredients.map(([name,text])=>name+': '+text))}
${result.habits.length?section('Οι καθημερινές σου συνήθειες',result.habits.map(key=>habits[key])):''}
<tr><td class="content" style="padding:36px"><p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#b8b5ac">${escape(disclaimer)}</p><p style="margin:0 0 32px;font-size:13px;line-height:1.7;color:#b8b5ac">Πηγές: American Academy of Dermatology<br><a style="color:#d5d3cb" href="https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin">Ενυδάτωση και ξηρότητα</a> · <a style="color:#d5d3cb" href="https://www.aad.org/public/everyday-care/sun-protection/sunscreen/how-to-select-sunscreen">Αντηλιακή προστασία</a></p><a href="https://primalcore.gr/skin-profile" style="display:inline-block;padding:16px 24px;background:#e3e0d5;color:#080808;text-decoration:none;font-size:15px;font-weight:bold;border-radius:6px">THE PRIMAL SKIN PROFILE</a></td></tr>
<tr><td align="center" style="padding:24px;border-top:1px solid #33332f;color:#b8b5ac;font-size:12px;line-height:1.8">PRIMAL CORE<br><a href="https://primalcore.gr/privacy" style="color:#b8b5ac">Ιδιωτικότητα</a></td></tr></table></td></tr></table></body></html>`;
}

export function skinResultAttachments(){return [{filename:'primal-core-bull.png',content:readFileSync(new URL('../public/assets/email-bull.png',import.meta.url)),cid:'primal-result-bull',contentType:'image/png',contentDisposition:'inline'}];}
