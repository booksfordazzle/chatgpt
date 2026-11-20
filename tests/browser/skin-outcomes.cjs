const assert=require('node:assert/strict');
const{chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.BASE_URL||'http://localhost:8097';
(async()=>{const browser=await chromium.launch({args:['--no-sandbox']});
 const cases=[{title:'RESTORE',goal:0},{title:'ENDURE',goal:1},{title:'CALM',goal:3},{title:'BALANCE',goal:4},{title:'ESSENTIAL',goal:5}];
 for(const width of[390,1440])for(const scenario of cases){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[],posts=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/skin-profile',route=>{if(route.request().method()==='POST')posts.push(route.request().postData());return route.fulfill({json:{researchV2:false,analytics:false}})});
  await page.goto(base+'/skin-profile');assert.equal(await page.locator('.profile-description br').count(),1);assert.equal(await page.locator('.profile-landing-question').count(),0);
  await page.locator('#profile-adult').check();await page.locator('#profile-start button').click();
  const answers=[0,0,3,scenario.goal,0,0,2,0,0,0];
  for(let q=0;q<10;q++){await page.locator('#question-content input').nth(answers[q]).check();await page.locator('#question-next').click()}
  assert.equal(await page.locator('#result-title').textContent(),scenario.title);
  const rows=page.locator('.profile-result-accordions details');assert.equal(await rows.count(),4);assert.equal(await page.locator('.profile-result-accordions details[open]').count(),0);
  await rows.first().locator('summary').click();const reason=await rows.first().textContent();assert(reason.includes('Ως βασική προτεραιότητα επέλεξες'));if(scenario.title==='CALM')assert(reason.includes('προκύπτει από τη δική σου επιλογή'));
  assert.equal(posts.length,0);assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.close();console.log('PASS',width,scenario.title,'via all ten real questions');
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
