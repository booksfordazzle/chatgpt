'use strict';
(() => {
  const config=window.PrimalAnalyticsConfig||{}, id=/^G-[A-Z0-9]{5,20}$/.test(config.measurementId||'')?config.measurementId:'';
  const key='primal-analytics-consent-v1', dedupeKey='primal-analytics-events-v1', maxAge=180*86400000;
  const denied={analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'};
  const events=new Set(['skin_profile_view','quiz_start','quiz_complete','survey_start','survey_complete','generate_lead','early_access_signup','product_interest']);
  const forms=new Set(['contact','result_email','waitlist']);
  let choice=null, loaded=false, pageCounted=false, seen=new Set();
  try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.version===1&&['granted','denied'].includes(saved.value)&&Date.now()-saved.at<maxAge&&saved.at<=Date.now())choice=saved.value;}catch{}
  window.dataLayer=window.dataLayer||[];
  function tag(){window.dataLayer.push(arguments);}
  tag('consent','default',denied);
  function allowed(){return choice==='granted';}
  function clearCookies(){
    const parts=location.hostname.split('.');const domains=['',...parts.map((_,i)=>'.'+parts.slice(i).join('.')).filter(d=>d.slice(1).includes('.'))];
    for(const cookie of document.cookie.split(';')){const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)|^_gid$/.test(name))continue;for(const domain of domains)document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'')+'; SameSite=Lax';}
  }
  function emit(name,params={}){if(!allowed()||!id)return false;const safe={};if(forms.has(params.form_id))safe.form_id=params.form_id;tag('event',name,{...safe,send_to:id,page_location:location.origin+location.pathname,page_referrer:'',page_title:'PRIMAL CORE'});return true;}
  function track(name,params){return events.has(name)&&emit(name,params);}
  function trackOnce(name,attempt,params={}){if(!allowed()||!id||!events.has(name))return false;const item=name+':'+(params.form_id||'')+':'+String(attempt).slice(0,80);if(seen.has(item))return false;const sent=track(name,params);if(sent){seen.add(item);if(seen.size>200)seen=new Set([...seen].slice(-200));try{sessionStorage.setItem(dedupeKey,JSON.stringify([...seen]));}catch{}}return sent;}
  function currentPage(){if(pageCounted||!allowed()||!id)return;pageCounted=true;emit('page_view');const landing=document.querySelector('#profile-landing');if(landing&&!landing.hidden)track('skin_profile_view');}
  function activate(){if(!allowed())return;if(id){window['ga-disable-'+id]=false;tag('consent','update',{...denied,analytics_storage:'granted'});if(!loaded){loaded=true;tag('js',new Date());tag('set','ads_data_redaction',true);tag('config',id,{send_page_view:false,cookie_expires:15552000,allow_google_signals:false,allow_ad_personalization_signals:false,ignore_referrer:true,page_location:location.origin+location.pathname,page_referrer:'',page_title:'PRIMAL CORE'});const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+id;script.onerror=()=>{script.remove();};document.head.append(script);}currentPage();}}
  function choose(value){choice=value;try{localStorage.setItem(key,JSON.stringify({version:1,value,at:Date.now()}));}catch{}if(value==='granted')activate();else{if(id)window['ga-disable-'+id]=true;tag('consent','update',denied);seen.clear();clearCookies();try{sessionStorage.removeItem(dedupeKey);sessionStorage.removeItem('primal-core-attribution-v1');sessionStorage.removeItem('primal-contact-lead-pending');}catch{}}document.querySelector('#analytics-consent').hidden=true;window.dispatchEvent(new CustomEvent('primal:analytics-consent',{detail:{granted:allowed()}}));syncQuizCheckbox();}
  function open(){document.querySelector('#analytics-consent').hidden=false;document.querySelector('#analytics-reject').focus();}
  function syncQuizCheckbox(){const box=document.querySelector('#profile-analytics');if(box)box.checked=allowed();}
  window.PrimalAnalytics={track,trackOnce,allowed,choose,open,configured:()=>Boolean(id)};
  if(allowed())try{const values=JSON.parse(sessionStorage.getItem(dedupeKey));if(Array.isArray(values))seen=new Set(values.filter(v=>typeof v==='string').slice(-200));}catch{}
  function boot(){
    if(!allowed())clearCookies();const en=document.documentElement.lang.startsWith('en');
    const panel=document.createElement('section');panel.id='analytics-consent';panel.setAttribute('aria-labelledby','analytics-consent-title');panel.setAttribute('role','region');panel.hidden=choice!==null;
    panel.innerHTML=`<div><h2 id="analytics-consent-title">${en?'Your privacy choices':'Η επιλογή σου για το απόρρητο'}</h2><p>${en?'With your permission, we use Google Analytics to measure visits and completed actions. Forms work without analytics.':'Επίλεξε αν επιτρέπεις Google Analytics για επισκέψεις και ολοκληρωμένες ενέργειες. Οι φόρμες λειτουργούν και χωρίς analytics.'}</p><a href="${en?'/en/privacy':'/privacy'}">${en?'Privacy policy':'Πολιτική απορρήτου'}</a></div><div class="analytics-consent-actions"><button id="analytics-reject" type="button">${en?'Reject optional':'Απόρριψη προαιρετικών'}</button><button id="analytics-accept" type="button">${en?'Accept analytics':'Αποδοχή analytics'}</button></div>`;
    document.body.append(panel);panel.querySelector('#analytics-reject').onclick=()=>choose('denied');panel.querySelector('#analytics-accept').onclick=()=>choose('granted');
    const settings=document.createElement('button');settings.type='button';settings.className='analytics-settings';settings.textContent=en?'Cookie settings':'Ρυθμίσεις cookies';settings.onclick=open;document.body.append(settings);
    const box=document.querySelector('#profile-analytics');if(box){syncQuizCheckbox();box.addEventListener('change',()=>choose(box.checked?'granted':'denied'));}
    // No automatic GA4 pageview before this task: result restoration runs first.
    setTimeout(()=>{activate();if(allowed()&&/^\/(?:en\/)?contact-sent(?:\.html)?\/?$/.test(location.pathname)){try{const pending=sessionStorage.getItem('primal-contact-lead-pending');if(pending&&Date.now()-Number(pending)<1800000&&Number(pending)<=Date.now()){sessionStorage.removeItem('primal-contact-lead-pending');trackOnce('generate_lead',pending,{form_id:'contact'});}}catch{}}},0);
  }
  if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
