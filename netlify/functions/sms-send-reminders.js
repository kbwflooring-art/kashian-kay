// sms-send-reminders.js
// Kashian Bros SMS reminders — STEP 3: the evening-before reminder.
// Separate from Kay. Reads TOMORROW's appointments from the calendar, pulls the
// phone number from the end of each event title (e.g. "9:30 Jane Smith 847-555-1234"),
// and texts the arrival window (the event's start–end time on the calendar).
//
// How to run (by hand only — no automatic schedule yet):
//   Preview (sends nothing):  /.netlify/functions/sms-send-reminders?key=YOUR_KEY&dryrun=1
//   Send for real:            /.netlify/functions/sms-send-reminders?key=YOUR_KEY
//
// Only texts customers whose Text Status is "Confirmed" (they replied YES).
// SAFETY: in test mode it reads ONLY the SMS_TEST_CALENDAR_ID calendar and can
// ONLY text numbers in SMS_ALLOWED_NUMBERS.

var crypto = require('crypto');

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

function chicagoDateStr(d){return d.toLocaleDateString('en-US',{timeZone:'America/Chicago'});}
function tomorrowChicago(){
  var p=new Date().toLocaleDateString('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).split('/');
  return new Date(Date.UTC(parseInt(p[2]),parseInt(p[0])-1,parseInt(p[1])+1,17,0,0));
}
function fmtTime(d){return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Chicago'});}
function fmtDay(d){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'America/Chicago'});}
function phoneFromText(s){
  var m=String(s||'').match(/\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/g);
  return m?normPhone(m[m.length-1]):null; // last phone number in the text
}
function calendarIds(){
  if(isTestMode())return [process.env.SMS_TEST_CALENDAR_ID].filter(Boolean);
  return String(process.env.SMS_LIVE_CALENDAR_IDS||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
}
async function getEvents(token,calId,tMin,tMax){
  var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calId)+'/events?singleEvents=true&orderBy=startTime&timeMin='+tMin.toISOString()+'&timeMax='+tMax.toISOString();
  var d=await (await fetch(url,{headers:{Authorization:'Bearer '+token}})).json();
  if(d.error)throw new Error('Calendar error ('+calId.slice(0,12)+'...): '+d.error.message);
  return d.items||[];
}

exports.handler=async function(event){
  var params=event.queryStringParameters||{};
  if(!process.env.SMS_ADMIN_KEY||params.key!==process.env.SMS_ADMIN_KEY)return text(403,'Not allowed.');
  var dry=params.dryrun==='1';
  var tom=tomorrowChicago(),tomStr=chicagoDateStr(tom);
  var out=['REMINDER TEXTS for '+fmtDay(tom)+' — '+(dry?'PREVIEW ONLY (nothing sent)':'SENDING')+' — test mode: '+(isTestMode()?'ON (only '+allowedNumbers().join(', ')+')':'OFF'),''];
  try{
    var cals=calendarIds();
    if(!cals.length)throw new Error(isTestMode()?'Missing SMS_TEST_CALENDAR_ID':'Missing SMS_LIVE_CALENDAR_IDS');
    var token=await getGoogleToken('https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/spreadsheets');
    var sheet=await loadSheet(token),c=sheet.cols;
    var now=new Date(),tMax=new Date(now.getTime()+60*3600*1000);
    var events=[];
    for(var i=0;i<cals.length;i++){events=events.concat(await getEvents(token,cals[i],now,tMax));}
    var done={},count=0;
    for(var j=0;j<events.length;j++){
      var e=events[j];
      if(e.status==='cancelled'||!e.start||!e.start.dateTime)continue;
      var start=new Date(e.start.dateTime),end=new Date(e.end.dateTime);
      if(chicagoDateStr(start)!==tomStr)continue;
      count++;
      var label='"'+(e.summary||'(no title)')+'" '+fmtTime(start)+'–'+fmtTime(end);
      var phone=phoneFromText(e.summary)||phoneFromText(e.description);
      if(!phone){out.push(label+': SKIPPED — no phone number found in title');continue;}
      if(done[phone]){out.push(label+': SKIPPED — already handled this number for tomorrow');continue;}
      done[phone]=true;
      var rowIdx=-1;
      for(var r=sheet.headerRow+1;r<sheet.values.length;r++){if(normPhone((sheet.values[r]||[])[c.phone])===phone){rowIdx=r;}}
      if(rowIdx<0){out.push(label+' '+phone+': SKIPPED — not in consent log');continue;}
      var row=sheet.values[rowIdx]||[];
      var status=String(row[c.status]||'').trim();
      if(status!=='Confirmed'){out.push(label+' '+phone+': SKIPPED — Text Status is "'+(status||'blank')+'", not Confirmed');continue;}
      if(String(row[c.lastReminder]||'').trim()===tomStr){out.push(label+' '+phone+': SKIPPED — reminder already sent for '+tomStr);continue;}
      if(!canSendTo(phone)){out.push(label+' '+phone+': SKIPPED — blocked by test mode');continue;}
      var msg='Kashian Bros: Reminder – your cleaning is scheduled for tomorrow, '+fmtDay(start)+', between '+fmtTime(start)+' and '+fmtTime(end)+'. Questions? Call (847) 251-1200. Reply STOP to opt out, HELP for help.';
      if(dry){out.push(label+' '+phone+': would send →\n   '+msg);continue;}
      try{
        await sendSms(phone,msg);
        await setCell(token,sheet,rowIdx,c.lastReminder,tomStr);
        out.push(label+' '+phone+': SENT');
      }catch(err){out.push(label+' '+phone+': ERROR — '+err.message);}
    }
    if(!count)out.push('No timed appointments found for tomorrow on the calendar(s) checked.');
    return text(200,out.join('\n'));
  }catch(e){out.push('ERROR: '+e.message);return text(500,out.join('\n'));}
};
