/** Add alongside Code.gs in the existing receiver project. No waitlist changes. */
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
