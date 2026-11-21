/** Add as a NEW AnalyticsDashboard.gs file; do not replace integration Code.gs.
 * Requires GA4_PROPERTY_ID in Script Properties and the AnalyticsData advanced service.
 * Data is aggregate and consented; no recipient or quiz-answer data is read.
 */
function refreshAnalyticsDashboard() {
  var property=PropertiesService.getScriptProperties().getProperty('GA4_PROPERTY_ID');
  if(!/^\d+$/.test(property||''))throw Error('Set numeric GA4_PROPERTY_ID in Script Properties first.');
  function report(dimensions,metrics,filter){
    var body={dateRanges:[{startDate:'29daysAgo',endDate:'today'}],dimensions:dimensions.map(function(n){return {name:n};}),metrics:metrics.map(function(n){return {name:n};}),limit:10000};
    if(filter)body.dimensionFilter=filter;
    if(typeof AnalyticsData==='undefined')throw Error('Add Google Analytics Data API under Apps Script Services first.');
    var result;
    try{result=AnalyticsData.Properties.runReport(body,'properties/'+property);}catch(_){throw Error('GA4 report unavailable. Check property access and Google Analytics Data API activation.');}
    if((result.rowCount||0)>10000)throw Error('GA4 report exceeds dashboard limit; nothing was written.');
    return result;
  }
  // Complete both remote reads before touching the dashboard.
  var traffic=report(['date'],['sessions','totalUsers','screenPageViews']);
  var funnel=report(['date','eventName'],['eventCount'],{filter:{fieldName:'eventName',inListFilter:{values:['skin_profile_view','quiz_start','quiz_complete','survey_start','survey_complete','generate_lead','early_access_signup','product_interest']}}});
  var rows=analyticsDashboardRows(traffic,funnel);
  var book=SpreadsheetApp.openById('1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA');
  var sheet=book.getSheetByName('Analytics Dashboard')||book.insertSheet('Analytics Dashboard');
  var headers=['Ημερομηνία','Επισκέψεις (sessions)','Χρήστες','Προβολές σελίδων','Quiz landing views','Quiz starts','Quiz completions','Survey starts','Survey completions','Lead submissions','Waitlist signups','Product interest'];
  sheet.getRange(1,1).setValue('PRIMAL CORE — Ημερήσια πορεία');
  sheet.getRange(2,1).setValue('GA4 · τελευταίες 30 ημέρες · μόνο επισκέπτες με συγκατάθεση · η σημερινή ημέρα μπορεί να είναι ελλιπής');
  sheet.getRange(3,1).setValue('Ενημέρωση: '+new Date().toISOString()+' · Οι μετρήσεις είναι ενέργειες, όχι μοναδικοί πελάτες.');
  sheet.getRange(4,1,1,headers.length).setValues([headers]).setFontWeight('bold').setBackground('#eeeeee').setWrap(true);
  if(sheet.getLastRow()>4)sheet.getRange(5,1,sheet.getLastRow()-4,headers.length).clearContent();
  if(rows.length)sheet.getRange(5,1,rows.length,headers.length).setValues(rows);
  sheet.setFrozenRows(4);sheet.setFrozenColumns(1);
  sheet.setColumnWidth(1,130);sheet.setColumnWidths(2,11,150);sheet.setRowHeight(4,48);
  if(rows.length){sheet.getRange(5,1,rows.length,1).setNumberFormat('@');sheet.getRange(5,2,rows.length,11).setNumberFormat('0');}
  sheet.getCharts().forEach(function(chart){if(chart.getOptions().get('title')==='Επισκέψεις και ολοκληρώσεις quiz')sheet.removeChart(chart);});
  if(rows.length){var chart=sheet.newChart().setChartType(Charts.ChartType.LINE).addRange(sheet.getRange(4,1,rows.length+1,2)).addRange(sheet.getRange(4,7,rows.length+1,1)).setNumHeaders(1).setPosition(6,14,0,0).setOption('title','Επισκέψεις και ολοκληρώσεις quiz').setOption('width',720).setOption('height',360).build();sheet.insertChart(chart);}
  // No emails, answers, identifiers or provider tokens are logged.
}
function analyticsDashboardRows(traffic,funnel){
  var days={},events=['skin_profile_view','quiz_start','quiz_complete','survey_start','survey_complete','generate_lead','early_access_signup','product_interest'];
  function day(key){if(!/^\d{8}$/.test(key))throw Error('Invalid report date');return days[key]||(days[key]=[key.slice(0,4)+'-'+key.slice(4,6)+'-'+key.slice(6,8),0,0,0,0,0,0,0,0,0,0,0]);}
  function number(value){var n=Number(value);if(!Number.isFinite(n)||n<0)throw Error('Invalid report metric');return n;}
  (traffic.rows||[]).forEach(function(r){var d=day(r.dimensionValues[0].value);r.metricValues.forEach(function(m,i){d[i+1]=number(m.value);});});
  (funnel.rows||[]).forEach(function(r){var i=events.indexOf(r.dimensionValues[1].value);if(i>=0)day(r.dimensionValues[0].value)[i+4]+=number(r.metricValues[0].value);});
  return Object.keys(days).sort().map(function(d){return days[d];});
}

/** Optional: owner runs explicitly to enable a daily aggregate refresh. */
function enableAnalyticsDashboardDaily(){
 refreshAnalyticsDashboard();
 if(!ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='refreshAnalyticsDashboard';}))ScriptApp.newTrigger('refreshAnalyticsDashboard').timeBased().atHour(7).everyDays(1).inTimezone('Europe/Athens').create();
}
