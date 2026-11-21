/** Standalone survey receiver: paste this entire file into the empty Code.gs. */
function setupSkinResearch() {
  // Run once from the editor and accept Google's requested Sheet permissions.
  SpreadsheetApp.openById('1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA').getName();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SKIN_PROFILE_RESEARCH_SECRET')) {
    props.setProperty('SKIN_PROFILE_RESEARCH_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  // Find the generated secret in Project Settings > Script properties. Never log it.
}
function doPost(event) {
  var lock = LockService.getScriptLock();
  var locked = false;
  function reply(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  try {
    if (!event || !event.postData || event.postData.contents.length > 2048) return reply({ok:false});
    var input = JSON.parse(event.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('SKIN_PROFILE_RESEARCH_SECRET');
    if (!input || Array.isArray(input) || typeof input !== 'object' || !secret || input.token !== secret || ['skin-research-v2','skin-quiz-v1'].indexOf(input.action)<0) return reply({ok:false});
    lock.waitLock(10000); locked = true;
    return reply(input.action==='skin-quiz-v1'?saveSkinQuiz(input):saveSkinResearch(input));
  } catch (_) { return reply({ok:false}); }
  finally { if (locked) lock.releaseLock(); }
}
/** Add alongside Code.gs in the existing receiver project. No waitlist changes. */
function saveSkinResearch(input) {
 var target = '1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA';
 var questions = [{"id":"problem","title":"Τι σε απασχολεί περισσότερο στην επιδερμίδα του προσώπου σου;","options":["Ξηρότητα και αφυδάτωση","Λεπτές γραμμές και ρυτίδες","Έλλειψη ελαστικότητας","Θαμπή και κουρασμένη όψη","Λιπαρότητα","Ευαισθησία και ερεθισμοί","Τίποτα ιδιαίτερο","Κάτι άλλο"]},{"id":"routine","title":"Τι χρησιμοποιείς σήμερα για την καθημερινή περιποίηση του προσώπου σου;","options":["Μια απλή ενυδατική κρέμα","Αντιγηραντική κρέμα","Έλαια ή φυσικά balms","Πολλαπλά προϊόντα περιποίησης","Προϊόντα μετά το ξύρισμα","Δεν χρησιμοποιώ τίποτα συστηματικά","Κάτι άλλο"]},{"id":"unmet","title":"Τι δεν σου αρέσει στα προϊόντα περιποίησης που έχεις χρησιμοποιήσει μέχρι σήμερα;","options":["Δεν βλέπω το αποτέλεσμα που περιμένω","Αφήνουν λιπαρή αίσθηση","Η ενυδάτωση δεν διαρκεί αρκετά","Έχουν έντονα αρώματα","Δεν γνωρίζω ή δεν καταλαβαίνω τα συστατικά","Είναι πολύ ακριβά","Η καθημερινή περιποίηση είναι περίπλοκη","Είμαι ικανοποιημένος από αυτά που χρησιμοποιώ","Κάτι άλλο"]},{"id":"concept","title":"Ποια είναι η πρώτη σου σκέψη για ένα balm προσώπου με βάση το επεξεργασμένο μοσχαρίσιο λίπος (beef tallow);","options":["Με ενδιαφέρει να το δοκιμάσω","Θέλω να μάθω περισσότερα για τα οφέλη του","Με προβληματίζει η μυρωδιά του","Με προβληματίζει η λιπαρότητά του","Με προβληματίζει η ασφάλεια ή η καταλληλότητά του","Δεν θα χρησιμοποιούσα συστατικό ζωικής προέλευσης","Δεν έχω σχηματίσει άποψη"]},{"id":"price","title":"Πόσα θα ήσουν διατεθειμένος να πληρώσεις για ένα balm καθημερινής περιποίησης προσώπου 50 ml, εφόσον καλύπτει τις ανάγκες σου;","options":["Κάτω από 20 €","15–19,99 €","20–24,99 €","25–29,99 €","30–39,99 €","40 € και άνω","Δεν θα αγόραζα τέτοιο προϊόν"]}];
 var fields = ['action','token','spreadsheetId','submissionId','consent'].concat(questions.map(function(q){return q.id;}));
 if(input.spreadsheetId!==target || input.consent!==true || typeof input.submissionId!=='string' || !/^[a-f0-9-]{36}$/i.test(input.submissionId) || Object.keys(input).some(function(k){return fields.indexOf(k)<0;}) || questions.some(function(q){return !Number.isInteger(input[q.id]) || input[q.id]<0 || input[q.id]>=q.options.length;}))return {ok:false};
 var book=SpreadsheetApp.openById(target);
 var sheet=book.getSheetByName('Skin Research') || book.insertSheet('Skin Research');
 var expected=['Submission ID','Submitted at (UTC)','Consent version'].concat(questions.map(function(q){return q.title;})),headers;
 if(sheet.getLastRow()===0){sheet.appendRow(expected);sheet.setFrozenRows(1);headers=expected.slice();}
 else {
  headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  if(headers.some(function(h,i){return h&&headers.indexOf(h)!==i;})||questions.some(function(q){return headers.indexOf(q.title)<0;}))return {ok:false};
  var missing=expected.filter(function(h){return headers.indexOf(h)<0;});
  if(missing.length){sheet.getRange(1,headers.length+1,1,missing.length).setValues([missing]);headers=headers.concat(missing);}
 }
 var existing=sheet.getLastRow()>1?sheet.getRange(2,headers.indexOf('Submission ID')+1,sheet.getLastRow()-1,1).getDisplayValues():[];
 var index=existing.findIndex(function(row){return row[0]===input.submissionId;}),row=index<0?sheet.getLastRow()+1:index+2;
 var valuesByHeader={'Submission ID':input.submissionId,'Consent version':'skin-research-v2'};
 questions.forEach(function(q){valuesByHeader[q.title]=q.options[input[q.id]];});
 if(index<0){valuesByHeader['Submitted at (UTC)']=new Date().toISOString();var values=headers.map(function(h){return valuesByHeader[h]||'';});var range=sheet.getRange(row,1,1,values.length);range.setNumberFormat('@');range.setValues([values]);SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(Object.keys(valuesByHeader).some(function(h){return saved[headers.indexOf(h)]!==valuesByHeader[h];}))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId};
}

/** Quiz-only tab; never writes into Skin Research. */
function skinQuizQuestions(){return [{"id":"q01","title":"Σε ποια ηλικία βρίσκεσαι;","options":["18–34","35–44","45–54","55–64","65+","Προτιμώ να μην απαντήσω"],"hint":"Για ενήλικες 18+. Η ηλικία δεν καθορίζει από μόνη της τη ρουτίνα σου."},{"id":"q02","title":"Μόλις έπλυνες το πρόσωπό σου.\nΤι αισθάνεσαι;","options":["Άνετο","Τραβάει","Τραβάει σε ορισμένα σημεία","Κάψιμο ή τσούξιμο","Δεν έχω προσέξει"],"hint":"","multiple":true,"exclusive":[0,4],"incompatible":[[1,2]],"maxChoices":2},{"id":"q03","title":"Πώς είναι το δέρμα σου μέσα στην ημέρα;","options":["Ξηρό ή τραχύ","Λιπαρό","Μικτό","Ισορροπημένο","Δεν είμαι σίγουρος/η"],"hint":""},{"id":"q04","title":"Αν μπορούσες να αλλάξεις ένα πράγμα στο δέρμα σου,\nποιο θα ήταν;","options":["Λιγότερη ξηρότητα","Λιγότερο εμφανείς λεπτές γραμμές και ρυτίδες","Απαλότητα και φυσική λάμψη","Λιγότερη δυσφορία από προϊόντα","Ισορροπία λιπαρότητας","Απλούστερη ρουτίνα"],"hint":""},{"id":"q05","title":"Πότε παρατηρείς τις λεπτές γραμμές στο πρόσωπό σου;","options":["Σπάνια","Κυρίως όταν η επιδερμίδα είναι ξηρή","Ορατές και σε χαλαρό πρόσωπο","Δεν με απασχολούν ιδιαίτερα"],"hint":""},{"id":"q06","title":"Πώς αντιδρά το δέρμα σου σε κάτι καινούργιο;","options":["Συνήθως καλά","Μερικές φορές ενόχληση","Συχνά κάψιμο ή ερεθισμός","Δεν δοκιμάζω συχνά"],"hint":""},{"id":"q07","title":"Με τι πλένεις το πρόσωπό σου;","options":["Νερό","Κοινό σαπούνι ή αφρόλουτρο","Καθαριστικό προσώπου","Συχνό scrub","Χωρίς σταθερή συνήθεια"],"hint":"","multiple":true,"exclusive":[4],"maxChoices":4},{"id":"q08","title":"Πόσο συχνά ενυδατώνεις το πρόσωπό σου;","options":["Καθημερινά","Μερικές φορές την εβδομάδα","Μόνο όταν νιώθω ξηρότητα","Σπάνια ή ποτέ"],"hint":""},{"id":"q09","title":"Πότε προστατεύεις το δέρμα σου από τον ήλιο;","options":["Καθημερινά","Όταν έχει έντονο ήλιο","Το καλοκαίρι","Σπάνια ή ποτέ"],"hint":""},{"id":"q10","title":"Η περιποίησή σου ανταποκρίνεται στις ανάγκες σου;","options":["Με καλύπτει","Δεν είμαι ικανοποιημένος/η","Χρησιμοποιώ περισσότερα προϊόντα από όσα θέλω","Δεν ξέρω από πού να ξεκινήσω"],"hint":""}];}
function skinQuizHeaders(){return ['Submission ID','Submitted at (UTC)','Consent version'].concat(skinQuizQuestions().map(function(q){return q.title;}),['Result']);}
function setupSkinQuiz(){var book=SpreadsheetApp.openById('1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA');var sheet=book.getSheetByName('Skin Quiz')||book.insertSheet('Skin Quiz');if(sheet.getLastRow()===0){sheet.appendRow(skinQuizHeaders());sheet.setFrozenRows(1);}}
function saveSkinQuiz(input){
 var target='1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA',qs=skinQuizQuestions();
 if(input.spreadsheetId!==target||input.consent!==true||typeof input.submissionId!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.submissionId)||Object.keys(input).some(function(k){return ['action','token','spreadsheetId','submissionId','consent','answers'].indexOf(k)<0;})||!Array.isArray(input.answers)||input.answers.length!==qs.length)return {ok:false};
 var answers=input.answers;
 if(qs.some(function(q,i){var a=answers[i],v=Array.isArray(a)?a:[a];return (Array.isArray(a)&&!q.multiple)||!v.length||v.length>(q.maxChoices||1)||new Set(v).size!==v.length||v.some(function(n){return !Number.isInteger(n)||n<0||n>=q.options.length;})||(v.length>1&&(q.exclusive||[]).some(function(n){return v.indexOf(n)>=0;}))||(q.incompatible||[]).some(function(g){return g.filter(function(n){return v.indexOf(n)>=0;}).length>1;});}))return {ok:false};
 var primary=(Array.isArray(answers[1])?answers[1]:[answers[1]]).indexOf(3)>=0||answers[5]===2?'CALM':['RESTORE','ENDURE','RESTORE','CALM','BALANCE','ESSENTIAL'][answers[3]];
 var labels=qs.map(function(q,i){return (Array.isArray(answers[i])?answers[i]:[answers[i]]).map(function(n){return q.options[n];}).join(' | ');});
 var book=SpreadsheetApp.openById(target),sheet=book.getSheetByName('Skin Quiz')||book.insertSheet('Skin Quiz'),expected=skinQuizHeaders(),headers;
 if(sheet.getLastRow()===0){sheet.appendRow(expected);sheet.setFrozenRows(1);headers=expected.slice();}
 else {
  headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  if(headers.some(function(h,i){return h&&headers.indexOf(h)!==i;}))return {ok:false};
  if(qs.some(function(q){return headers.indexOf(q.title)<0;}))return {ok:false};
  var missing=expected.filter(function(h){return headers.indexOf(h)<0;});
  if(missing.length){sheet.getRange(1,headers.length+1,1,missing.length).setValues([missing]);headers=headers.concat(missing);}
 }
 var idColumn=headers.indexOf('Submission ID'),existing=sheet.getLastRow()>1?sheet.getRange(2,idColumn+1,sheet.getLastRow()-1,1).getDisplayValues():[],index=existing.findIndex(function(r){return r[0]===input.submissionId;}),row=index<0?sheet.getLastRow()+1:index+2;
 var valuesByHeader={'Submission ID':input.submissionId,'Consent version':'skin-quiz-v1','Result':primary};
 qs.forEach(function(q,i){valuesByHeader[q.title]=labels[i];});
 if(index<0){valuesByHeader['Submitted at (UTC)']=new Date().toISOString();var values=headers.map(function(h){return valuesByHeader[h]||'';});sheet.getRange(row,1,1,values.length).setNumberFormat('@');sheet.getRange(row,1,1,values.length).setValues([values]);SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(Object.keys(valuesByHeader).some(function(h){return saved[headers.indexOf(h)]!==valuesByHeader[h];}))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId,sheetName:'Skin Quiz'};
}
