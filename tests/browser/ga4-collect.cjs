const assert=require('node:assert/strict');
// GA4 may put multiple event names in a POST body with no query-string en.
function collectEvents(url,body=''){
 const common=new URL(url).searchParams;
 if(body)return body.split('\n').filter(Boolean).map(line=>new URLSearchParams(line).get('en')||common.get('en')).filter(Boolean);
 return common.get('en')?[common.get('en')]:[];
}
function assertCounts(events,expected){for(const[name,count]of Object.entries(expected))assert.equal(events.filter(e=>e===name).length,count,`${name} count`);}
module.exports={collectEvents,assertCounts};
