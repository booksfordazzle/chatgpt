// Build-time typesetting only; no dependency or browser is used by the mail server.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox']});
 const font=fs.readFileSync('public/assets/GoogleSans.woff2').toString('base64');
 for(const [locale,text] of [['el','Καλώς ήρθες'],['en','Welcome']]){
  const page=await browser.newPage({viewport:{width:360,height:76},deviceScaleFactor:2});
  await page.setContent(`<html lang="${locale}"><style>@font-face{font-family:'Google Sans';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400 700}*{box-sizing:border-box}html,body{margin:0;background:#000;color:#f1f0e9}h1{width:360px;height:76px;margin:0;display:flex;align-items:center;justify-content:center;font:400 48px/1.15 'Google Sans';letter-spacing:-1px}</style><h1>${text}</h1></html>`);
  await page.evaluate(()=>document.fonts.ready);
  if(!await page.evaluate(()=>document.fonts.check('48px "Google Sans"')))throw Error('Google Sans not loaded');
  await page.locator('h1').screenshot({path:`public/assets/email-welcome-${locale}.png`});
  await page.close();
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
