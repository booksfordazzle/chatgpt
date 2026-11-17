const assert=require('node:assert/strict');
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const engine=process.env.BROWSER_ENGINE||'chromium';
const base=process.env.BASE_URL||'http://localhost:8080';
const fs=require('node:fs');
async function state(page){return page.locator('.hero-film').evaluate(scene=>({
 title:Number(getComputedStyle(scene.querySelector('#hero-title')).opacity),
 signup:Number(getComputedStyle(scene.querySelector('.hero-signup')).opacity),
 static:scene.classList.contains('is-hero-static'),
 poster:scene.classList.contains('is-hero-poster-intro'),
 paused:scene.querySelector('[data-film]').paused,
 inert:scene.querySelector('.hero-signup').inert
}));}
async function context(browser,{mode='blocked',hidden=false}={}){
 const context=await browser.newContext({viewport:{width:393,height:700},...(engine==='firefox'?{}:{isMobile:true}),hasTouch:true,ignoreHTTPSErrors:true});
 await context.addInitScript(({mode,hidden})=>{
  window.allowHeroPlayback=sessionStorage.getItem('warm-hero-test')==='1';
  // Record rendering frames in the page, including frames before the driver
  // receives the cold navigation result. Attribute observers can see transient
  // states inside a synchronous setup task that never reach the screen.
  window.heroSamples=[];
  let sampleFrames=0;
  function sample(){
   const scene=document.querySelector('.hero-film');
   if(scene?.classList.contains('has-timed-reveal'))window.heroSamples.push({title:Number(getComputedStyle(scene.querySelector('#hero-title')).opacity),signup:Number(getComputedStyle(scene.querySelector('.hero-signup')).opacity)});
   if(++sampleFrames<1200)requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
  const autoplay=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'autoplay');
  Object.defineProperty(HTMLMediaElement.prototype,'autoplay',{get:autoplay.get,set(value){autoplay.set.call(this,this.hasAttribute('data-film')&&!window.allowHeroPlayback?false:value)}});
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
   if(this.hasAttribute('data-film')&&!window.allowHeroPlayback)return mode==='pending'?new Promise(()=>{}):Promise.reject(new DOMException('in-app autoplay denied','NotAllowedError'));
   return play.call(this);
  };
  if(hidden){window.testHidden=true;Object.defineProperty(document,'hidden',{get:()=>window.testHidden,configurable:true})}
 },{mode,hidden});
 return context;
}
async function completeIntro(page,{screenshot}={}){
 let entered=false,peak=false,left=false,form=false;
 for(let i=0;i<130;i++){
  const s=await state(page);
  assert(!s.static,'Motion-enabled cold visit must not use stacked static text');
  assert(!(s.title>.05&&s.signup>.05),'Only one hero chapter may be visible');
  if(!peak&&s.title>.02&&s.title<.95)entered=true;
  if(s.title>.98){
   if(!peak&&screenshot)await page.screenshot({path:screenshot+'-title.png'});
   peak=true;
  }
  if(peak&&s.title>.02&&s.title<.95)left=true;
  if(s.signup>.99){form=true;assert(!s.inert);break}
  await page.waitForTimeout(60);
 }
 const samples=await page.evaluate(()=>window.heroSamples);
 let recordedPeak=false;
 for(const s of samples){
  assert(!(s.title>.05&&s.signup>.05),'Recorded startup frames must not show both chapters: '+JSON.stringify(s));
  if(!recordedPeak&&s.title>.02&&s.title<.95)entered=true;
  if(s.title>.98)recordedPeak=true;
  if(recordedPeak&&s.title>.02&&s.title<.95)left=true;
 }
 peak=peak||recordedPeak;
 assert(entered&&peak&&left&&form,JSON.stringify({entered,peak,left,form}));
 if(screenshot)await page.screenshot({path:screenshot+'-signup.png'});
}
(async()=>{
 const browser=await playwright[engine].launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined,args:engine==='chromium'?['--no-sandbox']:[],timeout:20000});
 console.log('Browser:',process.env.BROWSER_NAME||engine,browser.version());
 if(process.env.SCREENSHOT_DIR)fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});
 for(const lang of ['/','/en/']){
  const c=await context(browser),page=await c.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+lang,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.hero-film').classList.contains('is-hero-poster-intro'));
  const screenshot=process.env.SCREENSHOT_DIR?process.env.SCREENSHOT_DIR+'/'+engine+(lang==='/'?'-el':'-en'):undefined;
  await completeIntro(page,{screenshot});assert((await state(page)).paused,'Fixture must keep the first video blocked');
  await page.evaluate(()=>sessionStorage.setItem('warm-hero-test','1'));
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const v=document.querySelector('[data-film]');return !v.paused&&v.currentTime>.1});
  assert.equal((await state(page)).static,false);assert.equal((await state(page)).poster,false);
  assert.deepEqual(errors,[]);console.log('PASS cold blocked visit fades without refresh; warm reload plays normally',lang);await c.close();
 }
 {
  const c=await context(browser,{mode:'pending'}),page=await c.newPage();await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.hero-film').classList.contains('is-hero-poster-intro'));
  await page.evaluate(()=>window.allowHeroPlayback=true);await page.locator('[data-hero-toggle]').tap();
  await page.waitForFunction(()=>!document.querySelector('[data-film]').paused);
  assert.equal((await state(page)).static,false);console.log('PASS first tap retries a pending autoplay promise');await c.close();
 }
 {
  const c=await context(browser,{hidden:true}),page=await c.newPage();await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.hero-film').classList.contains('is-hero-poster-intro'));
  const before=await state(page);await page.waitForTimeout(400);assert.deepEqual(await state(page),before);
  await page.evaluate(()=>{window.testHidden=false;document.dispatchEvent(new Event('visibilitychange'))});
  await completeIntro(page);console.log('PASS in-app hidden first load waits until visible before fading');await c.close();
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
