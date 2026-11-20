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
    if (!input || Array.isArray(input) || typeof input !== 'object' || !secret || input.token !== secret || input.action !== 'skin-research-v2') return reply({ok:false});
    lock.waitLock(10000); locked = true;
    return reply(saveSkinResearch(input));
  } catch (_) { return reply({ok:false}); }
  finally { if (locked) lock.releaseLock(); }
}
/** Fixed-destination survey storage with readback and retry deduplication. */
function saveSkinResearch(input) {
 var target = '1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA';
 var questions = [{"id":"problem","title":"Τι σε απασχολεί περισσότερο στην επιδερμίδα του προσώπου σου;","options":["Ξηρότητα και αφυδάτωση","Λεπτές γραμμές και ρυτίδες","Έλλειψη ελαστικότητας","Θαμπή και κουρασμένη όψη","Λιπαρότητα","Ευαισθησία και ερεθισμοί","Τίποτα ιδιαίτερο","Κάτι άλλο"]},{"id":"routine","title":"Τι χρησιμοποιείς σήμερα για την καθημερινή περιποίηση του προσώπου σου;","options":["Μια απλή ενυδατική κρέμα","Αντιγηραντική κρέμα","Έλαια ή φυσικά balms","Πολλαπλά προϊόντα περιποίησης","Προϊόντα μετά το ξύρισμα","Δεν χρησιμοποιώ τίποτα συστηματικά","Κάτι άλλο"]},{"id":"unmet","title":"Τι δεν σου αρέσει στα προϊόντα περιποίησης που έχεις χρησιμοποιήσει μέχρι σήμερα;","options":["Δεν βλέπω το αποτέλεσμα που περιμένω","Αφήνουν λιπαρή αίσθηση","Η ενυδάτωση δεν διαρκεί αρκετά","Έχουν έντονα αρώματα","Δεν γνωρίζω ή δεν καταλαβαίνω τα συστατικά","Είναι πολύ ακριβά","Η καθημερινή περιποίηση είναι περίπλοκη","Είμαι ικανοποιημένος από αυτά που χρησιμοποιώ","Κάτι άλλο"]},{"id":"concept","title":"Ποια είναι η πρώτη σου σκέψη για ένα balm προσώπου με βάση το επεξεργασμένο μοσχαρίσιο λίπος (beef tallow);","options":["Με ενδιαφέρει να το δοκιμάσω","Θέλω να μάθω περισσότερα για τα οφέλη του","Με προβληματίζει η μυρωδιά του","Με προβληματίζει η λιπαρότητά του","Με προβληματίζει η ασφάλεια ή η καταλληλότητά του","Δεν θα χρησιμοποιούσα συστατικό ζωικής προέλευσης","Δεν έχω σχηματίσει άποψη"]},{"id":"price","title":"Πόσα θα ήσουν διατεθειμένος να πληρώσεις για ένα balm καθημερινής περιποίησης προσώπου 50 ml, εφόσον καλύπτει τις ανάγκες σου;","options":["Κάτω από 15 €","15–19,99 €","20–24,99 €","25–29,99 €","30–39,99 €","40 € και άνω","Δεν θα αγόραζα τέτοιο προϊόν"]}];
 var fields = ['action','token','spreadsheetId','submissionId','consent'].concat(questions.map(function(q){return q.id;}));
 if(input.spreadsheetId!==target || input.consent!==true || typeof input.submissionId!=='string' || !/^[a-f0-9-]{36}$/i.test(input.submissionId) || Object.keys(input).some(function(k){return fields.indexOf(k)<0;}) || questions.some(function(q){return !Number.isInteger(input[q.id]) || input[q.id]<0 || input[q.id]>=q.options.length;}))return {ok:false};
 var book=SpreadsheetApp.openById(target);
 var sheet=book.getSheetByName('Skin Research') || book.insertSheet('Skin Research');
 var headers=['Submission ID','Submitted at (UTC)','Consent version'].concat(questions.map(function(q){return q.title;}));
 if(sheet.getLastRow()===0){sheet.appendRow(headers);sheet.setFrozenRows(1);}
 else {var actual=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];if(JSON.stringify(actual)!==JSON.stringify(headers))return {ok:false};}
 var existing=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,1).getDisplayValues():[];
 var index=existing.findIndex(function(row){return row[0]===input.submissionId;});
 var answers=questions.map(function(q){return q.options[input[q.id]];});
 var row=index<0?sheet.getLastRow()+1:index+2;
 if(index<0){var values=[input.submissionId,new Date().toISOString(),'skin-research-v2'].concat(answers);var range=sheet.getRange(row,1,1,values.length);range.setNumberFormat('@');range.setValues([values]);SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(saved[0]!==input.submissionId || saved[2]!=='skin-research-v2' || JSON.stringify(saved.slice(3))!==JSON.stringify(answers))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId};
}
