// sms-check-reschedules.js
// Kashian Bros SMS reminders — STEP 4: reschedule notices.
// Separate from Kay. Watches the calendar for appointments whose date/time was
// EDITED, and texts the customer the new date and arrival window.
//
// How it works: it keeps a list of every upcoming appointment for Confirmed customers
// (on a tab called "SMS Appointments" in the consent sheet — created automatically).
// The first time it sees an appointment it just records it (no text). If a later run
// finds the start or end time changed, it sends the reschedule notice.
//
// How to run (by hand only — no automatic schedule yet):
//   Preview (sends nothing):  /.netlify/functions/sms-check-reschedules?key=YOUR_KEY&dryrun=1
//   Run for real:             /.netlify/functions/sms-check-reschedules?key=YOUR_KEY
//
// Quiet hours: notices only go out 8 AM–8 PM Chicago time. A change found outside those
// hours is held and sent on the next run inside the window.
// Only texts customers whose Text Status is "Confirmed". Cancelled/deleted events get no text.
// SAFETY: in test mode it reads ONLY SMS_TEST_CALENDAR_ID and can ONLY text SMS_ALLOWED_NUMBERS.

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

var TRACK_TAB='SMS Appointments';
var TRACK_HEADERS=['Event ID','Phone','Start','End','Last Notice Sent'];

function chicagoHour(){return parseInt(new Date().toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Chicago'}),10)%24;}
function inQuietHours(){var h=chicagoHour();return h<8||h>=20;}

async function loadTracking(token,sheetId,dry){
  var meta=await (await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+sheetId+'?fields=sheets.properties(sheetId,title)',{headers:{Authorization:'Bearer '+token}})).json();
  if(meta.error)throw new Error('Sheet error: '+meta.error.message);
  var exists=meta.sheets.some(function(s){return s.properties.title===TRACK_TAB;});
  if(!exists){
    if(dry)return {exists:false,rows:[TRACK_HEADERS],byId:{}};
    var r=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+sheetId+':batchUpdate',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:TRACK_TAB}}}]})});
    if(!r.ok){var d=await r.json();throw new Error('Could not create "'+TRACK_TAB+'" tab: '+(d.error&&d.error.message));}
    await putRow(token,sheetId,0,TRACK_HEADERS);
    return {exists:true,rows:[TRACK_HEADERS],byId:{}};
  }
  var vr=await (await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+sheetId+'/values/'+encodeURIComponent(q(TRACK_TAB)+'!A1:E5000'),{headers:{Authorization:'Bearer '+token}})).json();
  if(vr.error)throw new Error('Tracking read error: '+vr.error.message);
  var rows=vr.values||[TRACK_HEADERS],byId={};
  for(var i=1;i<rows.length;i++){if(rows[i]&&rows[i][0])byId[rows[i][0]]=i;}
  return {exists:true,rows:rows,byId:byId};
}
async function putRow(token,sheetId,rowIdx,vals){
  var range=q(TRACK_TAB)+'!A'+(rowIdx+1)+':'+colLetter(vals.length-1)+(rowIdx+1);
  var res=await fetch('https://sheets.googleapis.com/v4/spreadsheets/'+sheetId+'/values/'+encodeURIComponent(range)+'?valueInputOption=RAW',{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({values:[vals]})});
  if(!res.ok){var d=await res.json();throw new Error('Tracking write error: '+(d.error&&d.error.message));}
}

exports.handler=async function(event){
  var params=event.queryStringParameters||{};
  if(!process.env.SMS_ADMIN_KEY||params.key!==process.env.SMS_ADMIN_KEY)return text(403,'Not allowed.');
  var dry=params.dryrun==='1',quiet=inQuietHours();
  var out=['RESCHEDULE CHECK — '+(dry?'PREVIEW ONLY (nothing sent or saved)':'RUNNING')+' — test mode: '+(isTestMode()?'ON (only '+allowedNumbers().join(', ')+')':'OFF')+(quiet?' — QUIET HOURS (changes held until 8 AM)':''),''];
  try{
    var cals=calendarIds();
    if(!cals.length)throw new Error(isTestMode()?'Missing SMS_TEST_CALENDAR_ID':'Missing SMS_LIVE_CALENDAR_IDS');
    var token=await getGoogleToken('https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/spreadsheets');
    var sheet=await loadSheet(token),c=sheet.cols;
    var status={};
    for(var r=sheet.headerRow+1;r<sheet.values.length;r++){var row=sheet.values[r]||[];var p=normPhone(row[c.phone]);if(p)status[p]=String(row[c.status]||'').trim();}
    var track=await loadTracking(token,sheet.id,dry);
    var now=new Date(),tMax=new Date(now.getTime()+90*24*3600*1000);
    var events=[];
    for(var i=0;i<cals.length;i++){events=events.concat(await getEvents(token,cals[i],now,tMax));}
    var tracked=0,changed=0;
    for(var j=0;j<events.length;j++){
      var e=events[j];
      if(e.status==='cancelled'||!e.start||!e.start.dateTime||!e.id)continue;
      var phone=phoneFromText(e.summary)||phoneFromText(e.description);
      if(!phone||status[phone]!=='Confirmed')continue; // only confirmed customers
      var start=new Date(e.start.dateTime).toISOString(),end=new Date(e.end.dateTime).toISOString();
      var idx=track.byId[e.id];
      var label='"'+(e.summary||'')+'"';
      if(idx===undefined){
        tracked++;
        var newIdx=track.rows.length;
        track.rows.push([e.id,phone,start,end,'']);track.byId[e.id]=newIdx;
        if(!dry)await putRow(token,sheet.id,newIdx,[e.id,phone,start,end,'']);
        out.push(label+': now watching for changes ('+fmtDay(new Date(start))+' '+fmtTime(new Date(start))+'–'+fmtTime(new Date(end))+')');
        continue;
      }
      var old=track.rows[idx];
      if(old[2]===start&&old[3]===end)continue; // no change
      changed++;
      var s=new Date(start),en=new Date(end);
      var msg='Kashian Bros: Your cleaning appointment has been rescheduled to '+fmtDay(s)+' between '+fmtTime(s)+' and '+fmtTime(en)+'. Questions? Call (847) 251-1200. Reply STOP to opt out, HELP for help.';
      var was=fmtDay(new Date(old[2]))+' '+fmtTime(new Date(old[2]))+'–'+fmtTime(new Date(old[3]));
      if(!canSendTo(phone)){out.push(label+' '+phone+': CHANGED (was '+was+') — SKIPPED, blocked by test mode');if(!dry)await putRow(token,sheet.id,idx,[e.id,phone,start,end,old[4]||'']);continue;}
      if(quiet){out.push(label+' '+phone+': CHANGED (was '+was+') — held for quiet hours, will send after 8 AM');continue;}
      if(dry){out.push(label+' '+phone+': CHANGED (was '+was+') — would send →\n   '+msg);continue;}
      try{
        await sendSms(phone,msg);
        await putRow(token,sheet.id,idx,[e.id,phone,start,end,chicagoStamp()]);
        out.push(label+' '+phone+': CHANGED (was '+was+') — SENT reschedule notice');
      }catch(err){out.push(label+' '+phone+': ERROR — '+err.message);}
    }
    if(!tracked&&!changed)out.push('No new appointments and no changes found.');
    return text(200,out.join('\n'));
  }catch(e){out.push('ERROR: '+e.message);return text(500,out.join('\n'));}
};
