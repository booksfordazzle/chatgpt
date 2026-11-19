const assert=require('node:assert/strict');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.BASE_URL||'http://localhost:8097';
const fs=require('node:fs');
async function capture(page,options){await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));scrollTo(0,0);});await page.screenshot(options);}
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of[320,375,390,430,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:width===320?'reduce':'no-preference'});const page=await context.newPage();const posts=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/skin-profile',async route=>{const request=route.request();if(request.method()==='GET')return route.fulfill({json:{email:true,research:true,analytics:true}});posts.push(JSON.parse(request.postData()));return route.fulfill({json:{ok:true,status:'accepted'}});});
  await page.route('**/api/waitlist',async route=>{posts.push({action:'marketing',...JSON.parse(route.request().postData())});return route.fulfill({json:{ok:true}});});
  await page.goto(base+'/skin-profile?utm_campaign=launch&utm_content=private%40example.com');await page.waitForTimeout(100);await page.evaluate(()=>document.fonts.ready);
  if([390,1440].includes(width))await capture(page,{path:'.impeccable/review/skin-profile/landing-'+width+'.png',fullPage:true});
  await page.getByRole('button',{name:/Κάνε το τεστ/}).click();assert(await page.locator('#profile-quiz').isHidden());await page.locator('#profile-adult').check();await page.getByRole('button',{name:/Κάνε το τεστ/}).click();
  await page.locator('#question-next').click();assert(await page.locator('#question-error').textContent());
  const answers=[0,3,1,4,2,2,3,3,3,0];
  for(let q=0;q<10;q++){
   await page.locator('#question-content input').nth(answers[q]).check();
   if(q===1){await page.locator('#question-back').click();assert(await page.locator('#question-content input').nth(0).isChecked());await page.locator('#question-next').click();assert(await page.locator('#question-content input').nth(3).isChecked());}
   if(q===4&&[390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await capture(page,{path:'.impeccable/review/skin-profile/question-'+width+'.png',fullPage:true});}
   await page.locator('#question-next').click();
  }
  assert.equal(await page.locator('#result-title').textContent(),'Πρώτα η άνεση');assert(await page.locator('.profile-secondary').textContent().then(t=>t.includes('Ισορροπία')));assert(await page.locator('#profile-landing').isHidden());
  assert.equal(posts.length,0,'No posts without explicit actions/consent');
  if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await capture(page,{path:'.impeccable/review/skin-profile/results-'+width+'.png',fullPage:true});}
  await page.locator('#delivery-email').fill('owned@example.com');await page.locator('#result-email button').click();assert.equal(posts.length,0,'Email requires consent');await page.locator('#result-email input[name="deliveryConsent"]').check();await page.locator('#result-email button').click();await page.waitForFunction(()=>document.querySelector('#delivery-status').textContent.includes('δέχτηκε'));assert.equal(posts.filter(x=>x.action==='email').length,1);assert.equal(posts.filter(x=>x.action==='marketing').length,0);assert.equal(posts[0].answers,undefined);
  await page.locator('#product-interest').click();await page.locator('#skip-research').click();assert.equal(posts.filter(x=>x.action==='research').length,0);await page.locator('#product-interest').click();await page.locator('input[name="research-0"]').nth(2).check();await page.locator('#research-form input[name="consent"]').check();await page.locator('#research-form button[type="submit"]').click();await page.waitForFunction(()=>document.querySelector('#research-status').textContent.includes('καταγράφηκε'));const research=posts.find(x=>x.action==='research');assert.deepEqual(Object.keys(research).sort(),['action','consent','decision','interest','spend']);
  await page.locator('#marketing-email').fill('owned@example.com');await page.locator('#marketing-form button').click();assert.equal(posts.filter(x=>x.action==='marketing').length,0);await page.locator('#marketing-form input[name="consent"]').check();await page.locator('#marketing-form button').click();await page.waitForFunction(()=>document.querySelector('#marketing-status').textContent.includes('Εγγράφηκες'));const marketing=posts.find(x=>x.action==='marketing');assert.equal(marketing.utm_campaign,'launch');assert.equal(marketing.utm_content,undefined);assert.equal(marketing.result,undefined);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>localStorage.length),0);assert.equal(await page.evaluate(()=>sessionStorage.length),0);
  await page.locator('#profile-analytics').check();await page.waitForTimeout(100);assert(posts.filter(x=>x.action==='event').every(x=>Object.keys(x).length===3&&!('result'in x)));
  await page.locator('#edit-answers').click();assert(await page.locator('#question-content input').nth(0).isChecked());await page.locator('#question-back').click();console.log('PASS',width,'adult gate, back/next, comfort override, optional actions, no quiz storage/network, overflow, marketing separation');await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(base+'/skin-profile');assert(await page.locator('noscript').textContent().then(t=>t.includes('διαδραστική')));await context.close();
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
