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
    if (!input || Array.isArray(input) || typeof input !== 'object' || !secret || input.token !== secret || ['skin-research-v2','skin-quiz-v1','skin-profile-delivery-v1'].indexOf(input.action)<0) return reply({ok:false});
    lock.waitLock(10000); locked = true;
    if(input.action==='skin-profile-delivery-v1')return reply(saveSkinProfileDelivery(input));
    return reply(input.action==='skin-quiz-v1'?saveSkinQuiz(input):saveSkinResearch(input));
  } catch (_) { return reply({ok:false}); }
  finally { if (locked) lock.releaseLock(); }
}
/** Fixed-destination survey storage with readback and retry deduplication. */
function saveSkinResearch(input) {
 var target = '1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA';
 var questions = [{"id":"problem","title":"Τι σε απασχολεί περισσότερο στην επιδερμίδα του προσώπου σου;","options":["Ξηρότητα και αφυδάτωση","Λεπτές γραμμές και ρυτίδες","Έλλειψη ελαστικότητας","Θαμπή και κουρασμένη όψη","Λιπαρότητα","Ευαισθησία και ερεθισμοί","Τίποτα ιδιαίτερο","Κάτι άλλο"]},{"id":"routine","title":"Τι χρησιμοποιείς σήμερα για την καθημερινή περιποίηση του προσώπου σου;","options":["Μια απλή ενυδατική κρέμα","Αντιγηραντική κρέμα","Έλαια ή φυσικά balms","Πολλαπλά προϊόντα περιποίησης","Προϊόντα μετά το ξύρισμα","Δεν χρησιμοποιώ τίποτα συστηματικά","Κάτι άλλο"]},{"id":"unmet","title":"Τι δεν σου αρέσει στα προϊόντα περιποίησης που έχεις χρησιμοποιήσει μέχρι σήμερα;","options":["Δεν βλέπω το αποτέλεσμα που περιμένω","Αφήνουν λιπαρή αίσθηση","Η ενυδάτωση δεν διαρκεί αρκετά","Έχουν έντονα αρώματα","Δεν γνωρίζω ή δεν καταλαβαίνω τα συστατικά","Είναι πολύ ακριβά","Η καθημερινή περιποίηση είναι περίπλοκη","Είμαι ικανοποιημένος από αυτά που χρησιμοποιώ","Κάτι άλλο"]},{"id":"concept","title":"Ποια είναι η πρώτη σου σκέψη για ένα balm προσώπου με βάση το επεξεργασμένο μοσχαρίσιο λίπος (beef tallow);","options":["Με ενδιαφέρει να το δοκιμάσω","Θέλω να μάθω περισσότερα για τα οφέλη του","Με προβληματίζει η μυρωδιά του","Με προβληματίζει η λιπαρότητά του","Με προβληματίζει η ασφάλεια ή η καταλληλότητά του","Δεν θα χρησιμοποιούσα συστατικό ζωικής προέλευσης","Δεν έχω σχηματίσει άποψη"]},{"id":"price","title":"Πόσα θα ήσουν διατεθειμένος να πληρώσεις για ένα balm καθημερινής περιποίησης προσώπου 50 ml, εφόσον καλύπτει τις ανάγκες σου;","options":["Κάτω από 20 €","15–19,99 €","20–24,99 €","25–29,99 €","30–39,99 €","40 € και άνω","Δεν θα αγόραζα τέτοιο προϊόν"]}];
 var reasonTitle='Ποιος είναι ο βασικός λόγος που δεν θα το αγόραζες;';
 var reasons=['Η τιμή','Το beef tallow ως συστατικό','Δεν χρησιμοποιώ balm προσώπου','Κάτι άλλο'];
 var fields = ['action','token','spreadsheetId','submissionId','consent','reason'].concat(questions.map(function(q){return q.id;}));
 if(input.spreadsheetId!==target || input.consent!==true || typeof input.submissionId!=='string' || !/^[a-f0-9-]{36}$/i.test(input.submissionId) || Object.keys(input).some(function(k){return fields.indexOf(k)<0;}) || questions.some(function(q){return !Number.isInteger(input[q.id]) || input[q.id]<0 || input[q.id]>=q.options.length;}) || (input.price===6?(!Number.isInteger(input.reason)||input.reason<0||input.reason>=reasons.length):input.reason!==null))return {ok:false};
 var book=SpreadsheetApp.openById(target);
 var sheet=book.getSheetByName('Skin Research') || book.insertSheet('Skin Research');
 var headers=['Consent version'].concat(questions.map(function(q){return q.title;}),['Submission ID','Submitted at (UTC)']);
 if(sheet.getLastRow()===0){sheet.appendRow(headers.concat([reasonTitle]));sheet.setFrozenRows(1);}
 else {var actual=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];if(JSON.stringify(actual.slice(0,headers.length))!==JSON.stringify(headers))return {ok:false};if(actual[headers.length]&&actual[headers.length]!==reasonTitle)return {ok:false};if(!actual[headers.length])sheet.getRange(1,headers.length+1).setValue(reasonTitle);}
 var existing=sheet.getLastRow()>1?sheet.getRange(2,7,sheet.getLastRow()-1,1).getDisplayValues():[];
 var index=existing.findIndex(function(row){return row[0]===input.submissionId;});
 var answers=questions.map(function(q){return q.options[input[q.id]];});
 var row=index<0?sheet.getLastRow()+1:index+2;
 if(index<0){var values=['skin-research-v2'].concat(answers,[input.submissionId,new Date().toISOString()]);var range=sheet.getRange(row,1,1,values.length);range.setNumberFormat('@');range.setValues([values]);sheet.getRange(row,headers.length+1).setValue(input.price===6?reasons[input.reason]:'');SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(saved[6]!==input.submissionId || saved[0]!=='skin-research-v2' || JSON.stringify(saved.slice(1,6))!==JSON.stringify(answers) || sheet.getRange(row,headers.length+1).getDisplayValue()!==(input.price===6?reasons[input.reason]:''))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId};
}

/** Quiz-only tab; never writes into Skin Research. */
function skinQuizQuestions(){return [{"id":"q01","title":"Σε ποια ηλικία βρίσκεσαι;","options":["18–34","35–44","45–54","55–64","65+","Προτιμώ να μην απαντήσω"],"hint":"Για ενήλικες 18+. Η ηλικία δεν καθορίζει από μόνη της τη ρουτίνα σου."},{"id":"q02","title":"Μόλις έπλυνες το πρόσωπό σου.\nΤι αισθάνεσαι;","options":["Άνετο","Τραβάει","Τραβάει σε ορισμένα σημεία","Κάψιμο ή τσούξιμο","Δεν έχω προσέξει"],"hint":"","multiple":true,"exclusive":[0,4],"incompatible":[[1,2]],"maxChoices":2},{"id":"q03","title":"Πώς είναι το δέρμα σου μέσα στην ημέρα;","options":["Ξηρό ή τραχύ","Λιπαρό","Μικτό","Ισορροπημένο","Δεν είμαι σίγουρος/η"],"hint":""},{"id":"q04","title":"Αν μπορούσες να αλλάξεις ένα πράγμα στο δέρμα σου,\nποιο θα ήταν;","options":["Λιγότερη ξηρότητα","Λιγότερο εμφανείς λεπτές γραμμές και ρυτίδες","Απαλότητα και φυσική λάμψη","Λιγότερη δυσφορία από προϊόντα","Ισορροπία λιπαρότητας","Απλούστερη ρουτίνα"],"hint":""},{"id":"q05","title":"Πότε παρατηρείς τις λεπτές γραμμές στο πρόσωπό σου;","options":["Σπάνια","Κυρίως όταν η επιδερμίδα είναι ξηρή","Ορατές και σε χαλαρό πρόσωπο","Δεν με απασχολούν ιδιαίτερα"],"hint":""},{"id":"q06","title":"Πώς αντιδρά το δέρμα σου σε κάτι καινούργιο;","options":["Συνήθως καλά","Μερικές φορές ενόχληση","Συχνά κάψιμο ή ερεθισμός","Δεν δοκιμάζω συχνά"],"hint":""},{"id":"q07","title":"Με τι πλένεις το πρόσωπό σου;","options":["Νερό","Κοινό σαπούνι ή αφρόλουτρο","Καθαριστικό προσώπου","Συχνό scrub","Χωρίς σταθερή συνήθεια"],"hint":"","multiple":true,"exclusive":[4],"maxChoices":4},{"id":"q08","title":"Πόσο συχνά ενυδατώνεις το πρόσωπό σου;","options":["Καθημερινά","Μερικές φορές την εβδομάδα","Μόνο όταν νιώθω ξηρότητα","Σπάνια ή ποτέ"],"hint":""},{"id":"q09","title":"Πότε προστατεύεις το δέρμα σου από τον ήλιο;","options":["Καθημερινά","Όταν έχει έντονο ήλιο","Το καλοκαίρι","Σπάνια ή ποτέ"],"hint":""},{"id":"q10","title":"Η περιποίησή σου ανταποκρίνεται στις ανάγκες σου;","options":["Με καλύπτει","Δεν είμαι ικανοποιημένος/η","Χρησιμοποιώ περισσότερα προϊόντα από όσα θέλω","Δεν ξέρω από πού να ξεκινήσω"],"hint":""}];}
function skinQuizHeaders(){return ['Submission ID','Submitted at (UTC)','Consent version'].concat(skinQuizQuestions().map(function(q){return q.title;}),['Result','Φύλο (αυτοπροσδιορισμός)']);}
function setupSkinQuiz(){var book=SpreadsheetApp.openById('1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA');var sheet=book.getSheetByName('Skin Quiz')||book.insertSheet('Skin Quiz');if(sheet.getLastRow()===0){sheet.appendRow(skinQuizHeaders());sheet.setFrozenRows(1);}}
function saveSkinQuiz(input){
 var target='1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA',qs=skinQuizQuestions();
 if(input.spreadsheetId!==target||input.consent!==true||typeof input.submissionId!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.submissionId)||Object.keys(input).some(function(k){return ['action','token','spreadsheetId','submissionId','consent','answers','gender'].indexOf(k)<0;})||(input.gender!==undefined&&input.gender!==null&&['Άνδρας','Γυναίκα','Άλλο','Προτιμώ να μην απαντήσω'].indexOf(input.gender)<0)||!Array.isArray(input.answers)||input.answers.length!==qs.length)return {ok:false};
 var answers=input.answers, omitted=[5,6,8,9];
 var shortQuiz=omitted.every(function(i){return answers[i]===null;});
 if(qs.some(function(q,i){if(shortQuiz&&omitted.indexOf(i)>=0)return false;var a=answers[i],v=Array.isArray(a)?a:[a];return (Array.isArray(a)&&!q.multiple)||!v.length||v.length>(q.maxChoices||1)||new Set(v).size!==v.length||v.some(function(n){return !Number.isInteger(n)||n<0||n>=q.options.length;})||(v.length>1&&(q.exclusive||[]).some(function(n){return v.indexOf(n)>=0;}))||(q.incompatible||[]).some(function(g){return g.filter(function(n){return v.indexOf(n)>=0;}).length>1;});}))return {ok:false};
 var primary=(Array.isArray(answers[1])?answers[1]:[answers[1]]).indexOf(3)>=0||answers[5]===2?'CALM':['RESTORE','ENDURE','RESTORE','CALM','BALANCE','ESSENTIAL'][answers[3]];
 var labels=qs.map(function(q,i){if(answers[i]===null)return '';return (Array.isArray(answers[i])?answers[i]:[answers[i]]).map(function(n){return q.options[n];}).join(' | ');});
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
 var valuesByHeader={'Submission ID':input.submissionId,'Consent version':'skin-quiz-v1','Result':primary,'Φύλο (αυτοπροσδιορισμός)':input.gender||''};
 qs.forEach(function(q,i){valuesByHeader[q.title]=labels[i];});
 if(index<0){valuesByHeader['Submitted at (UTC)']=new Date().toISOString();var values=headers.map(function(h){return valuesByHeader[h]||'';});sheet.getRange(row,1,1,values.length).setNumberFormat('@');sheet.getRange(row,1,1,values.length).setValues([values]);SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(Object.keys(valuesByHeader).some(function(h){return saved[headers.indexOf(h)]!==valuesByHeader[h];}))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId,sheetName:'Skin Quiz'};
}

/** Delivery-only receipt. Never enrolls the recipient in Waitlist or marketing. */
function saveSkinProfileDelivery(input) {
  var target = '1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg';
  var allowed = ['action','token','spreadsheetId','submissionId','email','result','deliveryConsent','status'];
  if (input.spreadsheetId !== target || input.deliveryConsent !== true || input.status !== 'smtp-accepted' ||
      typeof input.submissionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.submissionId) ||
      typeof input.email !== 'string' || input.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(input.email) ||
      /[\r\n\x00]/.test(input.email) || ['M','A','C','B','E'].indexOf(input.result) < 0 ||
      Object.keys(input).some(function(k){return allowed.indexOf(k) < 0;})) return {ok:false};
  var book = SpreadsheetApp.openById(target), sheet = book.getSheetByName('Skin Profile Emails') || book.insertSheet('Skin Profile Emails');
  var expected = ['Submission ID','Email','Requested at (UTC)','Result','Delivery consent','Email status'];
  if (sheet.getLastRow() === 0) { sheet.appendRow(expected); sheet.setFrozenRows(1); }
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  if (JSON.stringify(headers) !== JSON.stringify(expected)) return {ok:false};
  var ids = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getDisplayValues() : [];
  var index = ids.findIndex(function(row){return row[0] === input.submissionId;});
  var rowNumber = index < 0 ? sheet.getLastRow()+1 : index+2;
  var safeEmail = "'" + input.email.trim();
  if (index < 0) {
    var values = [input.submissionId,safeEmail,new Date().toISOString(),input.result,'true','smtp-accepted'];
    var range = sheet.getRange(rowNumber,1,1,expected.length);
    range.setNumberFormat('@'); range.setValues([values]); SpreadsheetApp.flush();
  }
  var saved = sheet.getRange(rowNumber,1,1,expected.length).getDisplayValues()[0];
  if (saved[0] !== input.submissionId || String(saved[1]).replace(/^'/,'').toLowerCase() !== input.email.trim().toLowerCase() ||
      saved[3] !== input.result || saved[4] !== 'true' || saved[5] !== 'smtp-accepted') return {ok:false};
  return {ok:true,spreadsheetId:target,submissionId:input.submissionId,sheetName:'Skin Profile Emails'};
}
