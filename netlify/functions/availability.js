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

function toChicagoDate(date, hours, minutes) {
  // Create a date at the given Chicago time
  var str = date.toLocaleDateString('en-US',{timeZone:'America/Chicago'});
  var parts = str.split('/');
  var month = parseInt(parts[0])-1;
  var day = parseInt(parts[1]);
  var year = parseInt(parts[2]);
  // Use Chicago offset approximation (CDT=-5, CST=-6)
  // Better: build ISO string and parse
  var pad = function(n){return String(n).padStart(2,'0');};
  // Get UTC offset for Chicago
  var testDate = new Date(year, month, day, hours, minutes||0, 0);
  var chicagoStr = testDate.toLocaleString('en-US',{timeZone:'America/Chicago',hour12:false});
  var utcStr = testDate.toLocaleString('en-US',{hour12:false});
  return testDate;
}

// Check if a calendar has any event that OVERLAPS with the given time window
// An event overlaps if: event.start < windowEnd AND event.end > windowStart
function calSlotFree(events, day, startHr, endHr) {
  var dayStr = chicagoDateStr(day);
  
  // Build slot start and end in Chicago time
  var slotStart = new Date(day);
  slotStart.setHours(startHr, 0, 0, 0);
  var slotEnd = new Date(day);
  slotEnd.setHours(endHr, 0, 0, 0);

  // Convert slot times to proper Chicago timezone times
  var slotStartChicago = new Date(slotStart.toLocaleString('en-US',{timeZone:'America/Chicago'}));
  var slotEndChicago = new Date(slotEnd.toLocaleString('en-US',{timeZone:'America/Chicago'}));

  var overlapping = events.filter(function(e){
    if(!e.start) return false;
    var evStart = new Date(e.start.dateTime||e.start.date);
    var evEnd = new Date(e.end.dateTime||e.end.date);
    
    // Convert event times to Chicago
    var evStartChicago = new Date(evStart.toLocaleString('en-US',{timeZone:'America/Chicago'}));
    var evEndChicago = new Date(evEnd.toLocaleString('en-US',{timeZone:'America/Chicago'}));
    
    // Check same day
    var evDateStr = evStart.toLocaleDateString('en-US',{timeZone:'America/Chicago'});
    if(evDateStr !== dayStr) return false;
    
    // Check overlap: event overlaps slot if event starts before slot ends AND event ends after slot starts
    return evStartChicago < slotEndChicago && evEndChicago > slotStartChicago;
  });
  
  return overlapping.length === 0;
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

    var summary = 'REAL-TIME CALENDAR AVAILABILITY:\n\n';
    summary += 'CARPET & UPHOLSTERY CLEANING:\n';
    summary += 'Mon/Wed/Fri: Truck 1 AND Truck 2 available. Slot is open if EITHER truck has no overlapping jobs.\n';
    summary += 'Tue/Thu: ONLY Truck 1 available for carpet (Truck 2 crew runs Big Truck for rug pickup).\n\n';

    days.forEach(function(day){
      var dow = day.getDay();
      var isTueThu = (dow === 2 || dow === 4);
      var morningOpen, afternoonOpen;

      if(isTueThu){
        // Tue/Thu: only Truck 1 for carpet - check full overlap
        morningOpen = calSlotFree(t1Ev, day, 9, 12);
        afternoonOpen = calSlotFree(t1Ev, day, 12, 16);
      } else {
        // Mon/Wed/Fri: either truck free means slot available
        morningOpen = calSlotFree(t1Ev,day,9,12) || calSlotFree(t2Ev,day,9,12);
        afternoonOpen = calSlotFree(t1Ev,day,12,16) || calSlotFree(t2Ev,day,12,16);
      }

      var parts=[];
      if(morningOpen) parts.push('morning');
      if(afternoonOpen) parts.push('afternoon');
      summary += '- '+fmtDay(day)+(isTueThu?' (Truck 1 only)':'')+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
    });

    summary += '\nRUG PICKUP & DELIVERY (Big Truck - Tuesdays & Thursdays only):\n';
    days.filter(function(d){return d.getDay()===2||d.getDay()===4;}).forEach(function(day){
      var morningOpen = calSlotFree(pickupEv,day,9,12);
      var afternoonOpen = calSlotFree(pickupEv,day,12,16);
      var parts=[];
      if(morningOpen) parts.push('morning');
      if(afternoonOpen) parts.push('afternoon');
      summary += '- '+fmtDay(day)+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
    });

    return {statusCode:200,headers,body:JSON.stringify({summary:summary,updated:new Date().toISOString()})};
  } catch(e) {
    return {statusCode:500,headers,body:JSON.stringify({error:e.message})};
  }
};
