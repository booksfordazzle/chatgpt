export const questions = [
 ['Σε ποια ηλικία βρίσκεσαι;', ['18–34','35–44','45–54','55–64','65+','Προτιμώ να μην απαντήσω'], 'Για ενήλικες 18+. Η ηλικία δεν καθορίζει από μόνη της τη ρουτίνα σου.'],
 ['Μόλις έπλυνες το πρόσωπό σου.\nΤι αισθάνεσαι;', ['Άνετο','Τραβάει','Τραβάει σε ορισμένα σημεία','Κάψιμο ή τσούξιμο','Δεν έχω προσέξει']],
 ['Πώς είναι το δέρμα σου μέσα στην ημέρα;', ['Ξηρό ή τραχύ','Λιπαρό','Μικτό','Ισορροπημένο','Δεν είμαι σίγουρος/η']],
 ['Αν μπορούσες να αλλάξεις ένα πράγμα στο δέρμα σου,\nποιο θα ήταν;', ['Λιγότερη ξηρότητα','Λιγότερο εμφανείς λεπτές γραμμές και ρυτίδες','Απαλότητα και φυσική λάμψη','Λιγότερη δυσφορία από προϊόντα','Ισορροπία λιπαρότητας','Απλούστερη ρουτίνα']],
 ['Πότε παρατηρείς τις λεπτές γραμμές στο πρόσωπό σου;', ['Σπάνια','Κυρίως όταν η επιδερμίδα είναι ξηρή','Ορατές και σε χαλαρό πρόσωπο','Δεν με απασχολούν ιδιαίτερα']],
 ['Πώς αντιδρά το δέρμα σου σε κάτι καινούργιο;', ['Συνήθως καλά','Μερικές φορές ενόχληση','Συχνά κάψιμο ή ερεθισμός','Δεν δοκιμάζω συχνά']],
 ['Με τι πλένεις το πρόσωπό σου;', ['Νερό','Κοινό σαπούνι ή αφρόλουτρο','Καθαριστικό προσώπου','Συχνό scrub','Χωρίς σταθερή συνήθεια']],
 ['Πόσο συχνά ενυδατώνεις το πρόσωπό σου;', ['Καθημερινά','Μερικές φορές την εβδομάδα','Μόνο όταν νιώθω ξηρότητα','Σπάνια ή ποτέ']],
 ['Πότε προστατεύεις το δέρμα σου από τον ήλιο;', ['Καθημερινά','Όταν έχει έντονο ήλιο','Το καλοκαίρι','Σπάνια ή ποτέ']],
 ['Η περιποίησή σου ανταποκρίνεται στις ανάγκες σου;', ['Με καλύπτει','Δεν είμαι ικανοποιημένος/η','Χρησιμοποιώ περισσότερα προϊόντα από όσα θέλω','Δεν ξέρω από πού να ξεκινήσω']]
].map(([title,options,hint=''],i)=>({id:`q${String(i+1).padStart(2,'0')}`,title,options,hint}));
// V2 research has a separate metric namespace; never merge with the prior spend survey.
export const researchQuestions=[
  {
    "id": "problem",
    "title": "Τι σε απασχολεί περισσότερο στην επιδερμίδα του προσώπου σου;",
    "options": [
      "Ξηρότητα και αφυδάτωση",
      "Λεπτές γραμμές και ρυτίδες",
      "Έλλειψη ελαστικότητας",
      "Θαμπή και κουρασμένη όψη",
      "Λιπαρότητα",
      "Ευαισθησία και ερεθισμοί",
      "Τίποτα ιδιαίτερο",
      "Κάτι άλλο"
    ]
  },
  {
    "id": "routine",
    "title": "Τι χρησιμοποιείς σήμερα για την καθημερινή περιποίηση του προσώπου σου;",
    "options": [
      "Μια απλή ενυδατική κρέμα",
      "Αντιγηραντική κρέμα",
      "Έλαια ή φυσικά balms",
      "Πολλαπλά προϊόντα περιποίησης",
      "Προϊόντα μετά το ξύρισμα",
      "Δεν χρησιμοποιώ τίποτα συστηματικά",
      "Κάτι άλλο"
    ]
  },
  {
    "id": "unmet",
    "title": "Τι δεν σου αρέσει στα προϊόντα περιποίησης που έχεις χρησιμοποιήσει μέχρι σήμερα;",
    "options": [
      "Δεν βλέπω το αποτέλεσμα που περιμένω",
      "Αφήνουν λιπαρή αίσθηση",
      "Η ενυδάτωση δεν διαρκεί αρκετά",
      "Έχουν έντονα αρώματα",
      "Δεν γνωρίζω ή δεν καταλαβαίνω τα συστατικά",
      "Είναι πολύ ακριβά",
      "Η καθημερινή περιποίηση είναι περίπλοκη",
      "Είμαι ικανοποιημένος από αυτά που χρησιμοποιώ",
      "Κάτι άλλο"
    ]
  },
  {
    "id": "concept",
    "title": "Ποια είναι η πρώτη σου σκέψη για ένα balm προσώπου με βάση το επεξεργασμένο μοσχαρίσιο λίπος (beef tallow);",
    "options": [
      "Με ενδιαφέρει να το δοκιμάσω",
      "Θέλω να μάθω περισσότερα για τα οφέλη του",
      "Με προβληματίζει η μυρωδιά του",
      "Με προβληματίζει η λιπαρότητά του",
      "Με προβληματίζει η ασφάλεια ή η καταλληλότητά του",
      "Δεν θα χρησιμοποιούσα συστατικό ζωικής προέλευσης",
      "Δεν έχω σχηματίσει άποψη"
    ]
  },
  {
    "id": "price",
    "title": "Πόσα θα ήσουν διατεθειμένος να πληρώσεις για ένα balm καθημερινής περιποίησης προσώπου 50 ml, εφόσον καλύπτει τις ανάγκες σου;",
    "options": [
      "Κάτω από 15 €",
      "15–19,99 €",
      "20–24,99 €",
      "25–29,99 €",
      "30–39,99 €",
      "40 € και άνω",
      "Δεν θα αγόραζα τέτοιο προϊόν"
    ]
  }
];

// Editorial labels only; question IDs and assessment inputs remain unchanged.
export const chapters=['Ο χρόνος','Η αίσθηση','Η υφή','Η προτεραιότητα','Τα ίχνη του χρόνου','Η αντίδραση','Ο καθαρισμός','Η φροντίδα','Ο ήλιος','Η ουσία'];

// Owner image numbers match the ten quiz and five research questions.
// 1.png was not included: retain the approved fingerprint until supplied.
export const questionVisuals={
 1:{src:'assets/primal-code-central.webp',small:'assets/primal-code-central-600.webp',smallWidth:600,width:941,height:1671,position:'50% 65%',placeholder:true},
 2:{src:'assets/skin-questions/02.webp',small:'assets/skin-questions/02-small.webp',width:941,height:1672,position:'50% 44%'},
 3:{src:'assets/skin-questions/03.webp',small:'assets/skin-questions/03-small.webp',width:941,height:1672,position:'50% 45%'},
 4:{src:'assets/skin-questions/04.webp',small:'assets/skin-questions/04-small.webp',width:941,height:1672,position:'50% 45%'},
 5:{src:'assets/skin-questions/05.webp',small:'assets/skin-questions/05-small.webp',width:941,height:1672,position:'50% 45%'},
 6:{src:'assets/skin-questions/06.webp',small:'assets/skin-questions/06-small.webp',width:941,height:1672,position:'50% 58%'},
 7:{src:'assets/skin-questions/07.webp',small:'assets/skin-questions/07-small.webp',width:941,height:1672,position:'50% 62%'},
 8:{src:'assets/skin-questions/08.webp',small:'assets/skin-questions/08-small.webp',width:941,height:1672,position:'50% 56%'},
 9:{src:'assets/skin-questions/09.webp',small:'assets/skin-questions/09-small.webp',width:941,height:1671,position:'50% 42%'},
 10:{src:'assets/skin-questions/10.webp',small:'assets/skin-questions/10-small.webp',width:941,height:1671,position:'50% 46%'},
 11:{src:'assets/skin-questions/11.webp',small:'assets/skin-questions/11-small.webp',width:941,height:1670,position:'50% 43%'},
 12:{src:'assets/skin-questions/12.webp',small:'assets/skin-questions/12-small.webp',width:941,height:1670,position:'50% 68%'},
 13:{src:'assets/skin-questions/13.webp',small:'assets/skin-questions/13-small.webp',width:941,height:1671,position:'50% 57%'},
 14:{src:'assets/skin-questions/14.webp',small:'assets/skin-questions/14-small.webp',width:941,height:1670,position:'50% 70%'},
 15:{src:'assets/skin-questions/15.webp',small:'assets/skin-questions/15-small.webp',width:942,height:1670,position:'50% 68%'}
};
