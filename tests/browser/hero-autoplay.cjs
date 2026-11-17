const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const engine=process.env.BROWSER_ENGINE||'chromium';
const browserType=playwright[engine];
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://localhost:8080';
async function state(page){return page.locator('.hero-film').evaluate(s=>({title:Number(getComputedStyle(s).getPropertyValue('--hero-title-opacity')),signup:Number(getComputedStyle(s).getPropertyValue('--hero-signup-opacity')),shade:Number(getComputedStyle(s).getPropertyValue('--hero-shade-opacity')),inert:s.querySelector('.hero-signup').inert,static:s.classList.contains('is-hero-static')}));}
async function seek(page,time){await page.locator('[data-film]').evaluate(async(v,time)=>{v.pause();await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=time});v.dispatchEvent(new Event('timeupdate'))},time);return state(page)}
(async()=>{
 const browser=await browserType.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined,args:engine==='chromium'?['--no-sandbox']:[],timeout:20000});
 console.log('Browser:',process.env.BROWSER_NAME||engine,browser.version());
 for(const width of[390,1440])for(const lang of['','/en/']){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:844},...(engine==='chromium'?{isMobile:width<761}:{}),hasTouch:width<761});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+lang);await page.waitForFunction(()=>{const v=document.querySelector('[data-film]');return v.readyState>=2&&!v.paused&&v.currentTime>.05});await page.evaluate(()=>document.fonts.ready);
  const video=page.locator('[data-film]');const src=await video.getAttribute('src');assert(src.includes(width<761?'hero-loop-mobile.':'hero-loop-desktop.'));
  assert.equal(await video.evaluate(v=>v.loop&&v.muted&&v.playsInline),true);
  const geometry=await page.locator('.hero-film').evaluate(s=>({height:s.offsetHeight,stage:s.querySelector('.hero-sticky').offsetHeight,position:getComputedStyle(s.querySelector('.hero-sticky')).position}));assert.equal(geometry.height,geometry.stage);assert.equal(geometry.position,'relative');
  await video.evaluate(v=>{const descriptor=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'currentTime');v.scrollSeekWrites=0;Object.defineProperty(v,'currentTime',{configurable:true,get(){return descriptor.get.call(this)},set(value){this.scrollSeekWrites++;descriptor.set.call(this,value)}})});await page.evaluate(()=>scrollTo({top:100,behavior:'instant'}));await page.waitForTimeout(120);assert.equal(await video.evaluate(v=>v.scrollSeekWrites),0,'scroll must not seek video');await video.evaluate(v=>delete v.currentTime);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const duration=await video.evaluate(v=>v.duration),fps=width<761?60:24,start=duration-200/fps,span=duration-.05-start;
  let s=await seek(page,Math.max(0,start-1.25)+span*.18+.15);assert(s.title>.98&&s.signup<.01,JSON.stringify(s));
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SCREENSHOT_DIR}/hero-autoplay-title-${width}-${lang?'en':'el'}.png`});
  s=await seek(page,start+span*.58);assert(s.title<.02&&s.signup<.02,JSON.stringify(s));
  s=await seek(page,start+span*.95);assert(s.title<.01&&s.signup>.99&&!s.inert,JSON.stringify(s));
  await page.locator('.hero-signup [name=email]').fill('hero-test@example.invalid');
  await video.evaluate(async v=>{v.currentTime=v.duration-.1;v.playbackRate=3;await v.play()});await page.waitForFunction(()=>document.querySelector('[data-film]').currentTime<2);s=await state(page);assert(s.signup>.99&&!s.inert);assert.equal(await page.locator('.hero-signup [name=email]').inputValue(),'hero-test@example.invalid');
  await page.locator('[data-hero-toggle]').click();assert.equal(await video.evaluate(v=>v.paused),true);await page.locator('[data-hero-toggle]').click();await page.waitForFunction(()=>!document.querySelector('[data-film]').paused);
  if(process.env.SCREENSHOT_DIR)await page.screenshot({path:`${process.env.SCREENSHOT_DIR}/hero-autoplay-signup-${width}-${lang?'en':'el'}.png`});
  if(width===1440&&!lang){
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(()=>{const v=document.querySelector('[data-film]');return v.currentSrc.includes('hero-loop-mobile.')&&!v.paused});
    assert.equal(await page.locator('.hero-signup [name=email]').inputValue(),'hero-test@example.invalid');assert((await state(page)).signup>.99);
    await page.setViewportSize({width:1440,height:844});
    await page.waitForFunction(()=>{const v=document.querySelector('[data-film]');return v.currentSrc.includes('hero-loop-desktop.')&&!v.paused});
  }
  await page.locator('.hero-signup [name=consent]').check();let payload;await page.route('**/api/waitlist',async r=>{payload=r.request().postDataJSON();await r.fulfill({status:503,contentType:'application/json',body:'{"ok":false}'})});await page.locator('.hero-signup button[type=submit]').click();await page.locator('.hero-signup .form-status.error').waitFor();assert.equal(payload.source,'primal-core-hero');assert.equal(payload.consent,true);assert.equal(await page.locator('.hero-signup [name=email]').inputValue(),'hero-test@example.invalid');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);console.log('PASS autoplay, nonsticky layout, title-in/out, signup hold across loop, pause and mocked form:',width,lang||'el');await context.close();
 }
 // Native autoplay remains authoritative if a competing play() rejects later.
 {
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:844}});const page=await context.newPage();
  await page.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return this.hasAttribute('data-film')?new Promise((_resolve,reject)=>setTimeout(()=>reject(new DOMException('competing play','AbortError')),500)):play.call(this)}});
  await page.goto(base);await page.waitForFunction(()=>{const v=document.querySelector('[data-film]');return !v.paused&&v.currentTime>.8});
  assert.equal((await state(page)).static,false);console.log('PASS native autoplay survives rejected competing play');await context.close();
 }
 // An autoplay rejection or a slow first load must recover the timed text,
 // while a visitor already using the fallback form keeps their input visible.
 for(const preserveInput of [false,true]){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:844}});const page=await context.newPage();
  await page.addInitScript(()=>{window.allowHeroPlayback=false;const autoplay=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'autoplay');Object.defineProperty(HTMLMediaElement.prototype,'autoplay',{get:autoplay.get,set(value){autoplay.set.call(this,this.hasAttribute('data-film')&&!window.allowHeroPlayback?false:value)}});const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return this.hasAttribute('data-film')&&!window.allowHeroPlayback?Promise.reject(new DOMException('blocked','NotAllowedError')):play.call(this)}});
  await page.goto(base);await page.waitForFunction(()=>document.querySelector('.hero-film').classList.contains('is-hero-static'));
  if(preserveInput)await page.locator('.hero-signup [name=email]').fill('preserve@example.invalid');
  await page.evaluate(()=>window.allowHeroPlayback=true);await page.locator('[data-hero-toggle]').click();
  await page.waitForFunction(()=>{const s=document.querySelector('.hero-film'),v=s.querySelector('[data-film]');return !s.classList.contains('is-hero-static')&&!v.paused});
  if(preserveInput){assert((await state(page)).signup>.99);assert.equal(await page.locator('.hero-signup [name=email]').inputValue(),'preserve@example.invalid')}
  else{const v=page.locator('[data-film]'),duration=await v.evaluate(v=>v.duration),start=duration-200/24,span=duration-.05-start;const s=await seek(page,Math.max(0,start-1.25)+span*.18+.15);assert(s.title>.98&&s.signup<.01)}
  console.log('PASS autoplay fallback recovery and dedicated play toggle; preserve input:',preserveInput);await context.close();
 }
 for(const scenario of['failed','blocked','reduced','no-js']){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:700},reducedMotion:scenario==='reduced'?'reduce':'no-preference',javaScriptEnabled:scenario!=='no-js'});const page=await context.newPage();
  if(scenario==='failed')await page.route(/\/hero-loop-mobile\.(mp4|webm)(\?|$)/,r=>r.abort());
  if(scenario==='blocked')await page.addInitScript(()=>{const autoplay=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'autoplay');Object.defineProperty(HTMLMediaElement.prototype,'autoplay',{get:autoplay.get,set(value){autoplay.set.call(this,this.hasAttribute('data-film')?false:value)}});const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return this.hasAttribute('data-film')?Promise.reject(new DOMException('blocked','NotAllowedError')):original.call(this)}});
  await page.goto(base);await page.waitForFunction(()=>document.querySelector('.hero-film').classList.contains('is-hero-static')).catch(error=>{if(scenario!=='no-js')throw error});
  assert.equal(await page.locator('.hero-signup').evaluate(f=>f.inert),false);assert(await page.locator('#hero-title').isVisible());assert(await page.locator('.hero-signup [name=email]').isVisible());console.log('PASS readable poster/form fallback:',scenario);await context.close();
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
