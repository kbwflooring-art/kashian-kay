// sms-send-confirmations.js
// Kashian Bros SMS reminders — STEP 1: send the one-time confirmation text.
// Separate from Kay. Reuses the existing GOOGLE_SERVICE_ACCOUNT_JSON login.
//
// How to run (by hand only — nothing runs automatically):
//   Preview (sends nothing):  /.netlify/functions/sms-send-confirmations?key=YOUR_KEY&dryrun=1
//   Send for real:            /.netlify/functions/sms-send-confirmations?key=YOUR_KEY
//
// AUTO-FILL: first it scans the calendar for appointments tagged TXT in the title
// (e.g. "9:30 Jane Smith 847-555-1234 TXT") and adds a consent-log row for any
// phone number not already in the log. The TXT tag = staff read the script and
// the customer said yes on the phone.
// Who gets a text: rows in the consent sheet where the customer answered "Yes"
// and the "Text Status" column is still blank.
// SAFETY: while SMS_TEST_MODE is anything other than "false", ONLY numbers in
// SMS_ALLOWED_NUMBERS can be texted. Everyone else is skipped.

var crypto = require('crypto');

var CONFIRMATION_TEXT = "Kashian Bros: Reply YES to confirm appointment reminder texts. You'll get one reminder the evening before each appointment with your arrival window, plus a notice if your appointment is rescheduled. Msg & data rates may apply. Reply HELP for help, STOP to opt out. Terms: kashianbros.com/sms-terms Privacy: kashianbros.com/privacy";

// ---------- shared helpers ----------
function b64url(str){return Buffer.from(str).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}

async function getGoogleToken(scope){
  var raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if(!raw)throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_JSON');
  var creds=JSON.parse(raw);
  var now=Math.floor(Date.now()/1000);
  var h=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  var p=b64url(JSON.stringify({iss:creds.client_email,scope:scope,aud:'https://oauth2.googleapis.com/token',exp:now+3600,iat:now}));
  var s=h+'.'+p;
  var sign=crypto.createSign('RSA-SHA256');sign.update(s);
  var sig=sign.sign(creds.private_key,'base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  var res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+s+'.'+sig});
  var d=await res.json();
  if(!d.access_token)throw new Error('Google login failed: '+JSON.stringify(d));
  return d.access_token;
}

function normPhone(s){
  var d=String(s||'').replace(/\D/g,'');
  if(d.length===11&&d.charAt(0)==='1')d=d.slice(1);
  return d.length===10?'+1'+d:null;
}
function isTestMode(){return String(process.env.SMS_TEST_MODE||'true').trim().toLowerCase()!=='false';}
function allowedNumbers(){return String(process.env.SMS_ALLOWED_NUMBERS||'').split(',').map(normPhone).filter(Boolean);}
function canSendTo(phone){return !isTestMode()||allowedNumbers().indexOf(phone)!==-1;}

async function sendSms(to,body){
  var sid=process.env.TWILIO_ACCOUNT_SID,tok=process.env.TWILIO_AUTH_TOKEN,svc=process.env.TWILIO_MESSAGING_SERVICE_SID;
  if(!sid||!tok||!svc)throw new Error('Missing Twilio settings (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_MESSAGING_SERVICE_SID)');
  if(!canSendTo(to))throw new Error('Blocked by test mode: '+to);
  var form=new URLSearchParams({To:to,MessagingServiceSid:svc,Body:body});
  var res=await fetch('https://api.twilio.com/2010-04-01/Accounts/'+sid+'/Messages.json',{method:'POST',headers:{'Authorization':'Basic '+Buffer.from(sid+':'+tok).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:form.toString()});
  var d=await res.json();
  if(!res.ok)throw new Error('Twilio error: '+(d.message||JSON.stringify(d)));
  return d.sid;
}

function colLetter(i){var s='';i=i+1;while(i>0){var m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26);}return s;}
function q(title){return "'"+String(title).replace(/'/g,"''")+"'";}
function findCol(headers,re){for(var i=0;i<headers.length;i++){if(re.test(String(headers[i]||'').replace(/\s+/g,' ').trim()))return i;}return -1;}

async function loadSheet(token){
  var id=process.env.SMS_SHEET_ID;if(!id)throw new Error('Missing SMS_SHEET_ID');
  var meta=await (await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+id+'?fields=sheets.properties(sheetId,title)',{headers:{Authorization:'Bearer '+token}})).json();
  if(meta.error)throw new Error('Sheet error: '+meta.error.message);
  var gid=String(process.env.SMS_SHEET_GID||'');
  var tab=meta.sheets[0].properties;
  meta.sheets.forEach(function(s){if(String(s.properties.sheetId)===gid)tab=s.properties;});
  var vr=await (await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+id+'/values/'+encodeURIComponent(q(tab.title)+'!A1:Z2000'),{headers:{Authorization:'Bearer '+token}})).json();
  if(vr.error)throw new Error('Sheet read error: '+vr.error.message);
  var values=vr.values||[];
  var hr=-1;
  for(var r=0;r<Math.min(values.length,15);r++){
    var row=values[r]||[];
    var hasPhone=row.some(function(c){return /mobile|phone|cell/i.test(String(c||''));});
    var filled=row.filter(function(c){return String(c||'').trim();}).length;
    if(hasPhone&&filled>=3){hr=r;break;}
  }
  if(hr<0)throw new Error('Could not find the header row (needs a column named like "Mobile Number").');
  var headers=values[hr];
  var cols={
    phone:findCol(headers,/mobile/i)>=0?findCol(headers,/mobile/i):findCol(headers,/phone|cell/i),
    consent:findCol(headers,/consent given/i)>=0?findCol(headers,/consent given/i):findCol(headers,/answer|agree|said yes/i),
    script:findCol(headers,/script read/i),
    status:findCol(headers,/^text status$/i),
    confirmSent:findCol(headers,/^confirmation sent$/i),
    lastReminder:findCol(headers,/^last reminder sent$/i)
  };
  var missing=[];
  if(cols.status<0)missing.push('Text Status');
  if(cols.confirmSent<0)missing.push('Confirmation Sent');
  if(cols.lastReminder<0)missing.push('Last Reminder Sent');
  if(missing.length)throw new Error('Add these column headers to the consent sheet header row: '+missing.join(', ')+'. Headers found: '+headers.join(' | '));
  return {id:id,title:tab.title,headerRow:hr,headers:headers,values:values,cols:cols};
}

async function setCell(token,sheet,rowIdx,colIdx,value){
  var range=q(sheet.title)+'!'+colLetter(colIdx)+(rowIdx+1);
  var res=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+sheet.id+'/values/'+encodeURIComponent(range)+'?valueInputOption=RAW',{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({values:[[value]]})});
  if(!res.ok){var d=await res.json();throw new Error('Sheet write error: '+(d.error&&d.error.message));}
}
function chicagoStamp(){return new Date().toLocaleString('en-US',{timeZone:'America/Chicago'});}
function text(code,body){return{statusCode:code,headers:{'Content-Type':'text/plain; charset=utf-8'},body:body};}
// ---------- end helpers ----------


// ---------- calendar auto-fill ----------
function tagWord(){return String(process.env.SMS_TAG||'TXT').trim();}
function hasTag(title){var t=tagWord().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^A-Za-z0-9])'+t+'([^A-Za-z0-9]|$)','i').test(String(title||''));}
function phoneFromText(s){var m=String(s||'').match(/\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/g);return m?normPhone(m[m.length-1]):null;}
function nameFromTitle(title){
  var t=String(title||'');
  t=t.replace(/\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/g,' ');                 // phone
  var tg=tagWord().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  t=t.replace(new RegExp('(^|[^A-Za-z0-9])'+tg+'(?=[^A-Za-z0-9]|$)','ig'),' '); // tag
  t=t.replace(/^\s*\d{1,2}(:\d{2})?\s*(am|pm|a|p)?\.?\s*/i,'');                // leading time
  t=t.replace(/^\s*\d+\s*\.\s*/,'');                                          // stop number "1."
  return t.replace(/\s+/g,' ').trim();
}
function calendarIds(){
  if(isTestMode())return [process.env.SMS_TEST_CALENDAR_ID].filter(Boolean);
  return String(process.env.SMS_LIVE_CALENDAR_IDS||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
}
async function getEvents(token,calId,tMin,tMax){
  var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calId)+'/events?singleEvents=true&orderBy=startTime&maxResults=2500&timeMin='+tMin.toISOString()+'&timeMax='+tMax.toISOString();
  var d=await (await fetch(url,{headers:{Authorization:'Bearer '+token}})).json();
  if(d.error)throw new Error('Calendar error ('+calId.slice(0,12)+'...): '+d.error.message);
  return d.items||[];
}
function shortDate(d){return d.toLocaleDateString('en-US',{timeZone:'America/Chicago',month:'numeric',day:'numeric',year:'2-digit'});}
function shortTime(d){return d.toLocaleTimeString('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'});}
function findColNorm(headers,re){for(var i=0;i<headers.length;i++){if(re.test(String(headers[i]||'').replace(/\s+/g,' ').trim()))return i;}return -1;}
async function writeRow(token,sheet,rowIdx,rowValues){
  var range=q(sheet.title)+'!A'+(rowIdx+1)+':'+colLetter(rowValues.length-1)+(rowIdx+1);
  var res=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+sheet.id+'/values/'+encodeURIComponent(range)+'?valueInputOption=USER_ENTERED',{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({values:[rowValues]})});
  if(!res.ok){var d=await res.json();throw new Error('Sheet write error: '+(d.error&&d.error.message));}
}
async function autofillFromCalendar(token,sheet,dry,out){
  var cals=calendarIds();
  if(!cals.length){out.push('Calendar auto-fill skipped: no calendar set ('+(isTestMode()?'SMS_TEST_CALENDAR_ID':'SMS_LIVE_CALENDAR_IDS')+').');return;}
  var h=sheet.headers,c=sheet.cols;
  var col={date:findColNorm(h,/date consented/i),name:findColNorm(h,/customer name|^name$/i),appt:findColNorm(h,/appointment/i),employee:findColNorm(h,/employee|team member|staff/i),notes:findColNorm(h,/^notes?$/i)};
  var known={};
  for(var r=sheet.headerRow+1;r<sheet.values.length;r++){var p=normPhone((sheet.values[r]||[])[c.phone]);if(p)known[p]=true;}
  var now=new Date(),tMax=new Date(now.getTime()+90*24*3600*1000),added=0;
  for(var i=0;i<cals.length;i++){
    var evs=await getEvents(token,cals[i],now,tMax);
    for(var j=0;j<evs.length;j++){
      var e=evs[j];
      if(e.status==='cancelled'||!hasTag(e.summary))continue;
      var phone=phoneFromText(e.summary);
      if(!phone){out.push('Calendar: "'+e.summary+'" has '+tagWord()+' but no phone number — not added');continue;}
      if(known[phone])continue; // already in the log
      known[phone]=true;
      var start=new Date((e.start&&(e.start.dateTime||e.start.date))||now);
      var created=e.created?new Date(e.created):now;
      var row=[];for(var k=0;k<h.length;k++)row.push('');
      if(col.date>=0)row[col.date]=shortDate(created);
      if(col.name>=0)row[col.name]=nameFromTitle(e.summary);
      row[c.phone]=phone.replace(/^\+1(\d{3})(\d{3})(\d{4})$/,'$1-$2-$3');
      if(col.appt>=0)row[col.appt]=shortDate(start)+' '+shortTime(start);
      if(c.consent>=0)row[c.consent]='Yes';
      if(c.script>=0)row[c.script]='Yes';
      if(col.employee>=0)row[col.employee]=(e.creator&&(e.creator.displayName||e.creator.email))||'';
      if(col.notes>=0)row[col.notes]='Auto-added from calendar ('+tagWord()+' tag)';
      var rowIdx=sheet.values.length;
      if(dry){out.push('Calendar: would add consent-log row '+(rowIdx+1)+' for '+(row[col.name]||'')+' '+phone);}
      else{await writeRow(token,sheet,rowIdx,row);out.push('Calendar: added consent-log row '+(rowIdx+1)+' for '+(row[col.name]||'')+' '+phone);}
      sheet.values.push(row); // so the confirmation step below sees it
      added++;
    }
  }
  if(!added)out.push('Calendar: no new '+tagWord()+'-tagged appointments to add.');
  out.push('');
}

exports.handler=async function(event){
  var params=event.queryStringParameters||{};
  if(!process.env.SMS_ADMIN_KEY||params.key!==process.env.SMS_ADMIN_KEY)return text(403,'Not allowed.');
  var dry=params.dryrun==='1';
  var out=['CONFIRMATION TEXTS — '+(dry?'PREVIEW ONLY (nothing sent)':'SENDING')+' — test mode: '+(isTestMode()?'ON (only '+allowedNumbers().join(', ')+')':'OFF'),''];
  try{
    var token=await getGoogleToken('https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/spreadsheets');
    var sheet=await loadSheet(token);
    var c=sheet.cols,count=0;
    await autofillFromCalendar(token,sheet,dry,out);
    if(c.consent<0)out.push('Note: no consent/answer column found, so every row with a phone number counts as "Yes".');
    for(var r=sheet.headerRow+1;r<sheet.values.length;r++){
      var row=sheet.values[r]||[];
      var phone=normPhone(row[c.phone]);
      if(!phone)continue;
      var consent=c.consent<0?'yes':String(row[c.consent]||'');
      if(!/^\s*y(es)?\b/i.test(consent))continue;
      if(c.script>=0&&!/^\s*y(es)?\b/i.test(String(row[c.script]||''))){out.push('Row '+(r+1)+' '+phone+': SKIPPED — Script Read? is not Yes');continue;}
      if(String(row[c.status]||'').trim())continue; // already handled
      count++;
      if(!canSendTo(phone)){out.push('Row '+(r+1)+' '+phone+': SKIPPED — blocked by test mode');continue;}
      if(dry){out.push('Row '+(r+1)+' '+phone+': would send confirmation text');continue;}
      try{
        await sendSms(phone,CONFIRMATION_TEXT);
        await setCell(token,sheet,r,c.status,'Confirmation Sent');
        await setCell(token,sheet,r,c.confirmSent,chicagoStamp());
        out.push('Row '+(r+1)+' '+phone+': SENT');
      }catch(e){out.push('Row '+(r+1)+' '+phone+': ERROR — '+e.message);}
    }
    if(!count)out.push('Nobody new to confirm (rows need "Yes" and a blank Text Status).');
    return text(200,out.join('\n'));
  }catch(e){out.push('ERROR: '+e.message);return text(500,out.join('\n'));}
};
