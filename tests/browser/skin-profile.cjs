const assert=require('node:assert/strict');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.BASE_URL||'http://localhost:8097';
async function capture(page,path){await page.waitForTimeout(280);await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));scrollTo(0,0);});await page.screenshot({path,fullPage:true});}
(async()=>{const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of[320,375,390,430,768,1024,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:width===320?'reduce':'no-preference'});const page=await context.newPage(),posts=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/skin-profile',async route=>{const request=route.request();if(request.method()==='GET')return route.fulfill({json:{researchV2:true,analytics:true}});posts.push(JSON.parse(request.postData()));return route.fulfill({json:{ok:true}});});
  await page.goto(base+'/skin-profile');await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.profile-home,.profile-series').count(),0);assert(await page.locator('.profile-experience-name').isVisible());
  if([390,1440].includes(width))await capture(page,'.impeccable/review/skin-profile/landing-'+width+'.png');
  await page.locator('#profile-start button').click();assert(await page.locator('#profile-quiz').isHidden());await page.locator('#profile-adult').check();await page.locator('#profile-start button').click();
  await page.locator('#question-next').click();assert(await page.locator('#question-error').textContent());
  const answers=[0,3,1,4,2,2,3,3,3,0];
  for(let q=0;q<10;q++){
   if(width>900){const image=await page.locator('#profile-quiz .profile-question-visual').boundingBox(),title=await page.locator('#question-title').boundingBox();assert(image.x+image.width<title.x,'Portrait stays left during question entrance');}
   assert.equal(await page.locator('#profile-quiz .profile-question-visual').getAttribute('data-image-number'),String(q+1));await page.locator('#profile-quiz .profile-question-visual img').evaluate(i=>i.decode());
   assert(await page.locator('.profile-experience-name').isVisible());assert.equal((await page.locator('#question-next').innerText()).trim(),'');assert.equal((await page.locator('#question-back').innerText()).trim(),'');
   await page.locator('#question-content input').nth(answers[q]).check();
   if(q===1){assert.equal(await page.locator('#question-title br').count(),1);await page.locator('#question-back').click();assert(await page.locator('#question-content input').nth(0).isChecked());await page.locator('#question-next').click();assert(await page.locator('#question-content input').nth(3).isChecked());}
   if(q===3&&[390,1440].includes(width))await capture(page,'.impeccable/review/skin-profile/question-'+width+'.png');
   await page.locator('#question-next').click();
  }
  assert.equal(await page.locator('#result-title').textContent(),'CALM');assert.equal(posts.length,0);assert.equal(await page.locator('.profile-secondary,.profile-priority,#marketing-panel,#restart-profile,#product-concept').count(),0);
  assert.equal(await page.locator('.profile-result-head .profile-result-accordions details').count(),4);assert.equal(await page.locator('.profile-result-accordions details[open]').count(),0);assert.equal(await page.locator('#research-close').count(),0);assert(await page.locator('#result-final-note').isVisible());assert.equal(await page.locator('#result-final-note em').count(),1);assert.equal(await page.locator('.profile-result-head>.profile-result-accordions + #result-final-note').count(),1);assert.equal(await page.locator('#profile-results').getByText('Γενική ενημέρωση για αυτή την κατεύθυνση φροντίδας.',{exact:false}).count(),0);assert.equal(await page.locator('footer #result-final-note').count(),0);assert.equal(await page.locator('footer #profile-privacy-panel').count(),1);
  assert.equal(await page.locator('#research-invitation-title').textContent(),'Γίνε μέρος της δημιουργίας του PRIMAL CORE');
  assert.equal(await page.getByText('Γίνε μέρος της δημιουργίας του.',{exact:true}).count(),0);
  const resultLayout=await page.locator('.profile-result-opening').evaluate(e=>Object.fromEntries(['head','material','invitation'].map(k=>{const n=e.querySelector(k==='invitation'?'.profile-research-invitation':'.profile-result-'+k),r=n.getBoundingClientRect();return[k,{x:r.x,y:r.y,bottom:r.bottom,center:r.y+r.height/2}]})));
  if(width>1100){assert(resultLayout.head.x<resultLayout.material.x&&resultLayout.material.x<resultLayout.invitation.x);assert(Math.max(...Object.values(resultLayout).map(r=>r.center))-Math.min(...Object.values(resultLayout).map(r=>r.center))<2,'All result columns share the portrait midpoint');}
  else{assert(resultLayout.material.bottom+24<=resultLayout.head.y,'Portrait precedes result with breathing space');assert(resultLayout.head.bottom<resultLayout.invitation.y);}
  if([390,1440].includes(width))await capture(page,'.impeccable/review/skin-profile/results-'+width+'.png');
  await page.locator('#product-interest').click();assert(await page.locator('#result-final-note').isHidden());assert.equal(await page.locator('#profile-research details').count(),0);
  await page.locator('#research-next').click();assert.equal(await page.locator('#research-step').textContent(),'01 / 05');assert((await page.locator('#research-status').textContent()).includes('Επίλεξε'));
  assert.equal(await page.locator('#profile-research .profile-question-visual').getAttribute('data-image-number'),'11');await page.locator('#profile-research .profile-question-visual img').evaluate(i=>i.decode());
  await page.locator('input[name="research-answer"]').nth(2).check();await page.locator('#research-next').click();await page.locator('#research-back').click();assert(await page.locator('input[name="research-answer"]').nth(2).isChecked());await page.locator('#research-next').click();await page.locator('#research-back').click();await page.locator('#research-back').click();assert(await page.locator('#profile-results').isVisible());assert.equal(posts.length,0);
  await page.locator('#product-interest').click();await page.locator('#research-next').click();assert.equal(await page.locator('#research-step').textContent(),'02 / 05');
  if([390,1440].includes(width))await capture(page,'.impeccable/review/skin-profile/research-'+width+'.png');
  for(let r=1;r<5;r++){await page.locator('#research-next').click();assert.equal(await page.locator('#research-step').textContent(),String(r+1).padStart(2,'0')+' / 05');assert.equal(await page.locator('#profile-research .profile-question-visual').getAttribute('data-image-number'),String(11+r));await page.locator('#profile-research .profile-question-visual img').evaluate(i=>i.decode());await page.locator('input[name="research-answer"]').last().check();if(r<4)await page.locator('#research-next').click();}
  await page.locator('#research-next').click();assert.equal(posts.length,0,'No research without consent');await page.locator('input[name="consent"]').check();await page.locator('#research-next').click();await page.waitForFunction(()=>document.querySelector('#research-return'));
  const research=posts.find(x=>x.action==='research-v2');assert.deepEqual(Object.keys(research).sort(),['action','concept','consent','price','problem','routine','submissionId','unmet']);assert.equal(research.problem,2);assert.equal(research.price,6);assert.equal(posts.length,1);
  await page.locator('#research-return').click();await page.locator('#product-interest').click();assert(await page.locator('#research-return').isVisible());assert.equal(posts.length,1,'Completed research cannot be submitted again');await page.locator('#research-return').click();
  assert(await page.locator('footer #profile-privacy-panel').isVisible());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);assert.deepEqual(errors,[]);
  console.log('PASS',width,'ten questions, arrows, header, five research cards/back/close/consent, no duplicate submit, bottom-only notes, no storage/overflow/errors');await context.close();
 }
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(base+'/skin-profile');assert((await page.locator('noscript').textContent()).includes('διαδραστική'));await context.close();await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
