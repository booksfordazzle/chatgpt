import {editorialImage, editorialResult, escapeHtml, renderBlocks} from '../public/skin-profile/editorial-result.mjs';
import {validResult} from '../public/skin-profile/engine.mjs';

const defaultOrigin = 'https://primalcore.gr';
const styles = {
  p: 'margin:0 0 18px;font-size:16px;line-height:1.7;color:#d5d5d5',
  h3: 'margin:26px 0 12px;font-size:18px;line-height:1.4;color:#ffffff',
  ul: 'margin:0 0 22px;padding-left:22px;color:#d5d5d5',
  li: 'margin-bottom:8px;font-size:16px;line-height:1.55'
};

function httpsOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw Error('invalid_site_url');
  }
  return url.origin;
}

function imageRow(file, origin) {
  const {path, alt} = editorialImage(file);
  const url = new URL(path + '.jpg', origin + '/').href;
  return `<tr><td><img src="${escapeHtml(url)}" width="600" height="450" alt="${escapeHtml(alt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;background:#292929;color:#ffffff"></td></tr>`;
}

function emailSection({title, blocks, image}, origin) {
  return `${image ? imageRow(image, origin) : ''}
  <tr><td class="content" style="padding:36px 36px 20px;border-top:1px solid #292929">
  <h2 style="margin:0 0 22px;font-size:24px;line-height:1.3;color:#ffffff">${escapeHtml(title)}</h2>
  ${renderBlocks(blocks, styles)}</td></tr>`;
}

function html(profile, subject, origin) {
  return `<!doctype html><html lang="el"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHtml(subject)}</title><style>@media(max-width:600px){.content{padding-left:20px!important;padding-right:20px!important}.result-title{font-size:40px!important}}</style></head>
<body style="margin:0;padding:0;background:#080808;color:#ffffff;font-family:'Google Sans',Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(profile.title + ' — ' + profile.subtitle)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#080808"><tr><td align="center">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#171717" style="width:100%;max-width:600px;font-family:'Google Sans',Arial,sans-serif">
<tr><td align="center" bgcolor="#000000" style="padding:0 20px 24px;background:#000000;color:#ffffff">
<a href="${escapeHtml(origin)}/" style="color:#ffffff;text-decoration:none">
<img src="${escapeHtml(origin)}/assets/skin-profile-wordmark.png" width="320" height="119" alt="PRIMAL CORE" style="display:block;width:100%;max-width:320px;height:auto;margin:0 auto;border:0;color:#ffffff;font-size:18px;font-weight:bold">
</a>
<p style="margin:0;color:#ffffff;font-size:11px;line-height:1.5;letter-spacing:2px">BEEF TALLOW &amp; MASTIC</p>
</td></tr>
<tr><td class="content" style="padding:36px 36px 28px">
<h1 class="result-title" style="margin:0 0 14px;color:#ffffff;font-size:52px;line-height:1.1">${escapeHtml(profile.title)}</h1>
<p style="margin:0;color:#d5d5d5;font-size:22px;line-height:1.4">${escapeHtml(profile.subtitle)}</p></td></tr>
${imageRow(profile.hero, origin)}
<tr><td class="content" style="padding:36px 36px 20px">${renderBlocks(profile.intro, styles)}</td></tr>
${profile.sections.map(section => emailSection(section, origin)).join('')}
<tr><td class="content" style="padding:28px 36px;border-top:1px solid #292929"><p style="margin:0;color:#d5d5d5;font-size:14px;line-height:1.65">${escapeHtml(profile.disclaimer)}</p></td></tr>
<tr><td class="content" style="padding:24px 36px;border-top:1px solid #292929;color:#d5d5d5;font-size:13px;line-height:1.6">PRIMAL CORE · <a href="${escapeHtml(origin)}/privacy" style="color:#ffffff">Ιδιωτικότητα</a></td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`;
}

function plainBlocks(blocks) {
  return blocks.map(([tag, value]) => tag === 'ul' ? value.map(text => '• ' + text).join('\n') : value.replaceAll('**', ''));
}

export function renderSkinResultMessage(profile, siteUrl = defaultOrigin) {
  const origin = httpsOrigin(siteUrl);
  const subject = `Το Skin Profile σου — ${profile.title} | PRIMAL CORE`;
  const text = ['PRIMAL CORE', profile.title, profile.subtitle, ...plainBlocks(profile.intro),
    ...profile.sections.flatMap(section => [section.title, ...plainBlocks(section.blocks)]),
    profile.disclaimer, `${origin}/privacy`].join('\n\n');
  return {subject, text, html: html(profile, subject, origin)};
}

export function skinResultMessage(result, siteUrl) {
  if (!validResult(result)) throw Error('invalid_result');
  return renderSkinResultMessage(editorialResult(result), siteUrl);
}
