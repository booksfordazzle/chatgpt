const assert=require('node:assert/strict');
const{chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});
for(const scenario of[{wash:0,tolerance:0,goal:4,title:'BALANCE'},{wash:3,tolerance:0,goal:4,title:'CALM'},{wash:0,tolerance:2,goal:4,title:'CALM'},{wash:0,tolerance:0,goal:5,title:'ESSENTIAL'}]){
 const p=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await p.route('**/api/skin-profile',r=>r.fulfill({json:{researchV2:false,analytics:false}}));await p.goto(process.env.PREVIEW_FILE||(process.env.BASE_URL||'http://localhost:8097')+'/skin-profile');await p.locator('#profile-adult').check();await p.locator('#profile-start button').click();
 const initial=[0,3,3,4,0,2];for(const option of initial){await p.locator('#question-content input').nth(option).check();await p.locator('#question-next').click()}
 for(let i=0;i<5;i++)await p.locator('#question-back').click();
 const revised=[scenario.wash,3,scenario.goal,0,scenario.tolerance,2,0,0,0];
 for(const option of revised){await p.locator('#question-content input').nth(option).check();await p.locator('#question-next').click()}
 assert.equal(await p.locator('#result-title').textContent(),scenario.title);
 await p.locator('.profile-result-accordions details').first().locator('summary').click();const reason=await p.locator('.profile-result-accordions details').first().textContent();
 assert.equal(reason.includes('Ανέφερες κάψιμο ή τσούξιμο μετά το πλύσιμο'),scenario.wash===3);
 assert.equal(reason.includes('συχνό κάψιμο ή ερεθισμό με νέα προϊόντα'),scenario.tolerance===2);
 console.log('PASS edited answers',JSON.stringify(scenario));await p.close();
}await b.close()})().catch(e=>{console.error(e);process.exit(1)});
