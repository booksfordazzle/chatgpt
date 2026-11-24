const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

// Run against the local static site: npm run dev (port 8097).
(async () => {
 const browser = await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox']});
 try {
  for (const width of [390, 1440]) {
   for (const scenario of ['without-opt-in','with-opt-in','waitlist-failure','existing-subscriber']) {
    const page = await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    const delivered = [], subscriptions = [];
    await page.route('**/api/skin-profile', route => {
     if (route.request().method() === 'GET') return route.fulfill({json:{email:true,researchV2:true,analytics:false}});
     const payload = route.request().postDataJSON();
     if (payload.action === 'email') { delivered.push(payload); return route.fulfill({json:{ok:true,status:'accepted_and_saved'}}); }
     return route.fulfill({json:{ok:true}});
    });
    await page.route('**/api/waitlist', route => {
     subscriptions.push(route.request().postDataJSON());
     if (scenario === 'waitlist-failure') return route.fulfill({status:502,json:{ok:false}});
     return route.fulfill({json:{ok:true,registration:scenario==='existing-subscriber'?'existing':'new'}});
    });
    await page.goto('http://localhost:8097/skin-profile');
    if (await page.locator('#analytics-reject').isVisible()) await page.locator('#analytics-reject').click();
    await page.locator('#profile-adult').check();
    await page.locator('#profile-start button').click();
    await page.locator('#question-content [name=gender]').last().check();
    for (let i=0;i<10;i++) {
     await page.locator('#question-content [name=answer]').first().check();
     await page.locator('#question-next').click();
    }
    const completion = page.locator('#profile-results');
    await completion.waitFor();
    assert.equal(await completion.locator('h1').textContent(),'Λάβε το αποτέλεσμά σου στο email σου');
    assert.equal(await completion.locator('.skin-editorial, #result-final-note').count(),0);
    await page.reload();
    await completion.waitFor();
    assert.equal(await completion.locator('h1').textContent(),'Λάβε το αποτέλεσμά σου στο email σου');
    assert.equal(await completion.locator('.skin-editorial, #result-final-note').count(),0);
    const email = page.locator('#result-email');
    assert.equal(await page.locator('#result-email-form [name=emailChoice]:checked').count(),0);
    await email.fill('controlled@example.com');
    await page.locator('#result-email-form button').click();
    assert.equal(delivered.length,0,'a delivery choice must be made explicitly');
    assert.equal(subscriptions.length,0);
    await email.fill('invalid-email');
    await page.locator('#result-email-form [value=result]').check();
    await page.locator('#result-email-form button').click();
    assert.equal(delivered.length,0);
    await email.fill('controlled@example.com');
    if (scenario!=='without-opt-in') await page.locator('#result-email-form [value=result-and-updates]').check();
    await page.locator('#result-email-form button').dblclick();
    await page.waitForFunction(() => document.querySelector('#result-email-status')?.textContent.includes('στάλθηκε'));
    assert.equal(delivered.length,1, 'result email must be submitted once');
    assert.equal(await completion.locator('.skin-editorial, #result-final-note').count(),0);
    assert.equal(delivered[0].result.primary,'M');
    assert.equal(delivered[0].email,'controlled@example.com');
    assert.equal(delivered[0].deliveryConsent,true);
    assert.equal('waitlistConsent' in delivered[0],false);
    assert.equal(subscriptions.length,scenario==='without-opt-in'?0:1);
    if (subscriptions.length) {
     assert.deepEqual(Object.keys(subscriptions[0]).sort(),['consent','email','landing_path','lang','source'].sort());
     assert.equal(subscriptions[0].consent,true);
     assert.equal(subscriptions[0].source,'primal-core-skin-profile');
     assert.equal(subscriptions[0].email,'controlled@example.com');
    }
    if (scenario==='waitlist-failure') assert.match(await page.locator('#result-email-status').textContent(),/δεν επιβεβαιώθηκε/);
    await page.locator('#result-email-form').evaluate(form => form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    assert.equal(delivered.length,1,'repeated submission should be ignored');
    assert.equal(subscriptions.length,scenario==='without-opt-in'?0:1);
    assert(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth));
    await page.close();
   }
   console.log('PASS: Skin Quiz email/waitlist scenarios at viewport',width);
  }
 } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
