var crypto = require('crypto');

var PICKUP_CAL = 'a19e4f2968fbefb546c8e0177788a8a3d6efcf2ce2eb251444197b4a84379e4a@group.calendar.google.com';
var TRUCK1_CAL = '9c77e8f3275959d025aacba0b2a15a3235e8e8ee02ed36d965ce6950304c22f1@group.calendar.google.com';
var TRUCK2_CAL = '805de988185d3df181289a2bcdd242110c6e5ca38fb00424a2dab03af1ca4114@group.calendar.google.com';

function b64url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}

async function getToken(creds) {
  var now = Math.floor(Date.now()/1000);
  var h = b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  var p = b64url(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now+3600,
    iat: now
  }));
  var s = h+'.'+p;
  var sign = crypto.createSign('RSA-SHA256');
  sign.update(s);
  var sig = sign.sign(creds.private_key,'base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  var jwt = s+'.'+sig;
  var res = await fetch('https://oauth2.googleapis.com/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+jwt
  });
  var d = await res.json();
  if(!d.access_token) throw new Error('No access token: '+JSON.stringify(d));
  return d.access_token;
}

async function getEvents(token, calId, tMin, tMax) {
  try {
    var url = 'https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calId)+'/events?singleEvents=true&orderBy=startTime&timeMin='+tMin.toISOString()+'&timeMax='+tMax.toISOString();
    var res = await fetch(url,{headers:{Authorization:'Bearer '+token}});
    var d = await res.json();
    return d.items||[];
  } catch(e) { return []; }
}

function weekdays(n) {
  var days=[], d=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Chicago'}));
  d.setHours(0,0,0,0); d.setDate(d.getDate()+1);
  while(days.length<n){if(d.getDay()!==0&&d.getDay()!==6)days.push(new Date(d));d.setDate(d.getDate()+1);}
  return days;
}

function chicagoDateStr(date) {
  return date.toLocaleDateString('en-US',{timeZone:'America/Chicago'});
}

function chicagoHour(date) {
  return parseInt(date.toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Chicago'}),10);
}

function slots(events, day) {
  var dayStr = chicagoDateStr(day);
  var ev = events.filter(function(e){
    var s = new Date(e.start.dateTime||e.start.date);
    return chicagoDateStr(s) === dayStr;
  });
  var mc = ev.filter(function(e){
    var h = chicagoHour(new Date(e.start.dateTime||e.start.date));
    return h >= 9 && h < 12;
  }).length;
  var ac = ev.filter(function(e){
    var h = chicagoHour(new Date(e.start.dateTime||e.start.date));
    return h >= 12 && h < 16;
  }).length;
  return {m:mc<1, a:ac<1};
}

function fmtDay(d) {
  return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'America/Chicago'});
}

exports.handler = async function(event) {
  var headers = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers,body:''};
  try {
    var raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if(!raw) throw new Error('Missing credentials');
    var creds = JSON.parse(raw);
    var token = await getToken(creds);
    var days = weekdays(10);
    var tMin = new Date(days[0]); tMin.setHours(0,0,0,0);
    var tMax = new Date(days[days.length-1]); tMax.setHours(23,59,59,999);
    var results = await Promise.all([
      getEvents(token,PICKUP_CAL,tMin,tMax),
      getEvents(token,TRUCK1_CAL,tMin,tMax),
      getEvents(token,TRUCK2_CAL,tMin,tMax)
    ]);
    var pickupEv=results[0], t1Ev=results[1], t2Ev=results[2];
    var summary = 'REAL-TIME CALENDAR AVAILABILITY:\n\nCARPET & UPHOLSTERY CLEANING (Mon-Fri):\n';
    days.forEach(function(day){
      var t1=slots(t1Ev,day), t2=slots(t2Ev,day);
      var mo=t1.m||t2.m, ao=t1.a||t2.a;
      var parts=[];
      if(mo) parts.push('morning');
      if(ao) parts.push('afternoon');
      summary += '- '+fmtDay(day)+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
    });
    summary += '\nRUG PICKUP & DELIVERY (Tuesdays & Thursdays only):\n';
    days.filter(function(d){return d.getDay()===2||d.getDay()===4;}).forEach(function(day){
      var pu=slots(pickupEv,day);
      var parts=[];
      if(pu.m) parts.push('morning');
      if(pu.a) parts.push('afternoon');
      summary += '- '+fmtDay(day)+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
    });
    return {statusCode:200,headers,body:JSON.stringify({summary:summary,updated:new Date().toISOString()})};
  } catch(e) {
    return {statusCode:500,headers,body:JSON.stringify({error:e.message})};
  }
};
