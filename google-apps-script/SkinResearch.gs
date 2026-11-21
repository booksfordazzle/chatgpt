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
