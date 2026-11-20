export const RESEARCH_SPREADSHEET_ID='1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA';
export function researchSheetsSettings(env){
 const url=new URL(env.SKIN_PROFILE_RESEARCH_SCRIPT_URL||env.GOOGLE_APPS_SCRIPT_URL);
 if(url.protocol!=='https:'||url.hostname!=='script.google.com'||url.port||url.username||url.password||url.search||url.hash||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname)||!(env.SKIN_PROFILE_RESEARCH_SECRET||env.WAITLIST_SHARED_SECRET))throw Error('not_configured');
 return url.href;
}
export const saveResearchToSheets=(data,options)=>saveToSheets(data,options,'skin-research-v2');
export const saveQuizToSheets=(data,options)=>saveToSheets(data,options,'skin-quiz-v1');
async function saveToSheets(data,{env,fetchImpl},action){
 const signal=AbortSignal.timeout(10000);
 let response=await fetchImpl(researchSheetsSettings(env),{method:'POST',redirect:'manual',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token:env.SKIN_PROFILE_RESEARCH_SECRET||env.WAITLIST_SHARED_SECRET,spreadsheetId:RESEARCH_SPREADSHEET_ID,...data})});
 if([302,303].includes(response.status)){
  const url=new URL(response.headers.get('location'));
  if(url.protocol!=='https:'||url.hostname!=='script.googleusercontent.com'||url.pathname!=='/macros/echo'||url.username||url.password||url.port)throw Error('unconfirmed');
  response=await fetchImpl(url.href,{method:'GET',redirect:'error',signal});
 }
 if(!response.ok)throw Error('unconfirmed');
 const saved=await response.json();
 if(action==='skin-quiz-v1'&&saved.sheetName!=='Skin Quiz')throw Error('unconfirmed');
 if(saved.ok!==true||saved.spreadsheetId!==RESEARCH_SPREADSHEET_ID||saved.submissionId!==data.submissionId)throw Error('unconfirmed');
}
