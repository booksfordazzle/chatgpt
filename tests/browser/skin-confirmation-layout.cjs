const assert=require('node:assert/strict');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  let sent=0,subscriptions=0;
  await page.route('**/api/skin-profile',route=>{if(route.request().method()==='GET')return route.fulfill({json:{email:true,researchV2:true,analytics:false}});sent++;return route.fulfill({json:{ok:true,status:'accepted_and_saved'}})});
  await page.route('**/api/waitlist',route=>{subscriptions++;return route.fulfill({status:502,json:{ok:false}})});
  await page.goto('http://localhost:8097/skin-profile');
  if(await page.locator('#analytics-reject').isVisible())await page.locator('#analytics-reject').click();
  await page.locator('#profile-adult').check();await page.locator('#profile-start button').click();
  for(let i=0;i<10;i++){await page.locator('#question-content [name=answer]').first().check();if(i===0)await page.locator('[name=gender]').first().check();await page.locator('#question-next').click()}
  await page.locator('#result-email').fill('controlled@example.com');await page.locator('[name=deliveryConsent]').check();await page.locator('[name=waitlistConsent]').check();await page.locator('#result-email-form button').click();
  await page.waitForFunction(()=>document.querySelector('#result-email-status').textContent.includes('δεν επιβεβαιώθηκε'));
  assert.equal(sent,1);assert.equal(subscriptions,1);
  assert.equal(await page.locator('#result-email-form button').isDisabled(),true);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('#result-email-title').evaluate(n=>parseFloat(getComputedStyle(n).fontSize)<=34));
  if(width===1440){assert(await page.locator('.skin-delivery-image img').evaluate(n=>n.naturalWidth>0));assert.equal(await page.locator('.skin-editorial-actions').evaluate(n=>getComputedStyle(n).display),'grid')}
  await page.locator('.skin-editorial-actions').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/primal-confirmation-'+width+'.png'});
  await page.close();console.log('PASS confirmation layout, truthful partial success and no duplicate send '+width);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
