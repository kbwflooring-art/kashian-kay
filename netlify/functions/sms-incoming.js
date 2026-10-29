// sms-incoming.js
// Kashian Bros SMS reminders — STEP 2: handles customer replies (Twilio webhook).
// Separate from Kay. Twilio calls this automatically when someone texts our number.
//   YES / START / UNSTOP          -> Text Status = "Confirmed"
//   STOP / UNSUBSCRIBE / CANCEL...-> Text Status = "Opted Out"
// Twilio itself handles STOP/HELP/START replies and blocking. This file sends ONE
// reply of its own: the "you're confirmed" text after a first-time YES.
// Every request is checked against Twilio's signature, so outsiders can't fake replies.

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

function twilioSignatureOk(event,params){
  var tok=process.env.TWILIO_AUTH_TOKEN;
  var sig=(event.headers||{})['x-twilio-signature'];
  if(!tok||!sig)return false;
  var keys=Object.keys(params).sort();
  var urls=[process.env.SMS_WEBHOOK_URL,event.rawUrl].filter(Boolean);
  for(var i=0;i<urls.length;i++){
    var data=urls[i]+keys.map(function(k){return k+params[k];}).join('');
    var expected=crypto.createHmac('sha1',tok).update(Buffer.from(data,'utf-8')).digest('base64');
    var a=Buffer.from(expected),b=Buffer.from(sig);
    if(a.length===b.length&&crypto.timingSafeEqual(a,b))return true;
  }
  return false;
}
function xmlEsc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function twiml(reply){return{statusCode:200,headers:{'Content-Type':'text/xml'},body:'<?xml version="1.0" encoding="UTF-8"?><Response>'+(reply?'<Message>'+xmlEsc(reply)+'</Message>':'')+'</Response>'};}
// Sent once when a customer replies YES to the confirmation text (matches the mock exchange approved by Twilio).
var CONFIRMED_REPLY="Kashian Bros: Thanks, you're confirmed for appointment reminder texts. Msg frequency: one reminder per appointment plus reschedule notices. Msg & data rates may apply. Reply HELP for help, STOP to opt out.";

var YES_WORDS=['YES','Y','START','UNSTOP'];
var STOP_WORDS=['STOP','STOPALL','UNSUBSCRIBE','CANCEL','END','QUIT','OPTOUT','REVOKE'];

exports.handler=async function(event){
  if(event.httpMethod!=='POST')return text(405,'POST only');
  var raw=event.isBase64Encoded?Buffer.from(event.body||'','base64').toString('utf-8'):(event.body||'');
  var params={};new URLSearchParams(raw).forEach(function(v,k){params[k]=v;});
  if(!twilioSignatureOk(event,params))return text(403,'Bad signature');
  try{
    var from=normPhone(params.From);
    var word=String(params.Body||'').trim().toUpperCase().replace(/[^A-Z]/g,' ').trim().split(/\s+/)[0]||'';
    var newStatus=YES_WORDS.indexOf(word)!==-1?'Confirmed':(STOP_WORDS.indexOf(word)!==-1?'Opted Out':null);
    if(!from||!newStatus){console.log('Incoming ignored:',from,word);return twiml();}
    var token=await getGoogleToken('https://www.googleapis.com/auth/spreadsheets');
    var sheet=await loadSheet(token);
    var c=sheet.cols,updated=0,sendConfirmedReply=false;
    for(var r=sheet.headerRow+1;r<sheet.values.length;r++){
      var row=sheet.values[r]||[];
      if(normPhone(row[c.phone])!==from)continue;
      var cur=String(row[c.status]||'').trim();
      // Only confirm people who were actually sent the confirmation text (or re-joining after STOP).
      if(newStatus==='Confirmed'&&cur!=='Confirmation Sent'&&cur!=='Opted Out')continue;
      await setCell(token,sheet,r,c.status,newStatus);
      updated++;
      if(newStatus==='Confirmed'&&cur==='Confirmation Sent'&&(word==='YES'||word==='Y'))sendConfirmedReply=true;
    }
    console.log('Incoming',word,'from',from,'-> rows updated:',updated);
    // Only reply to a first-time YES (START already gets Twilio's own reply), and respect test mode.
    if(sendConfirmedReply&&canSendTo(from))return twiml(CONFIRMED_REPLY);
  }catch(e){console.log('Incoming error:',e.message);}
  return twiml();
};
