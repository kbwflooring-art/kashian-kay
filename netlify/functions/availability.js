var crypto = require('crypto');

var PICKUP_CAL = 'a19e4f2968fbefb546c8e0177788a8a3d6efcf2ce2eb251444197b4a84379e4a@group.calendar.google.com';
var TRUCK1_CAL = '9c77e8f3275959d025aacba0b2a15a3235e8e8ee02ed36d965ce6950304c22f1@group.calendar.google.com';
var TRUCK2_CAL = '805de988185d3df181289a2bcdd242110c6e5ca38fb00424a2dab03af1ca4114@group.calendar.google.com';

// === BUSINESS RULES ===
var TRAVEL_BUFFER_MIN = 15;     // 15 min buffer between jobs for travel
var DAY_OPEN_HOUR = 9;          // first job starts 9 AM
var LAST_JOB_START_HOUR = 15;   // last job must START by 3 PM (per Kashian Bros scheduling rules)
var DAY_CLOSE_HOUR = 17;        // weekday close (5 PM) — used only for daily summary view
// Saturday: closed for cleaning crews (reserved for showroom only)

function b64url(str){return Buffer.from(str).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');}

async function getToken(creds){
  var now=Math.floor(Date.now()/1000);
  var h=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));
  var p=b64url(JSON.stringify({iss:creds.client_email,scope:'https://www.googleapis.com/auth/calendar.readonly',aud:'https://oauth2.googleapis.com/token',exp:now+3600,iat:now}));
  var s=h+'.'+p;
  var sign=crypto.createSign('RSA-SHA256');sign.update(s);
  var sig=sign.sign(creds.private_key,'base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  var jwt=s+'.'+sig;
  var res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+jwt});
  var d=await res.json();
  if(!d.access_token)throw new Error('No token: '+JSON.stringify(d));
  return d.access_token;
}

async function getEvents(token,calId,tMin,tMax){
  try{
    var url='https://www.googleapis.com/calendar/v3/calendars/'+encodeURIComponent(calId)+'/events?singleEvents=true&orderBy=startTime&timeMin='+tMin.toISOString()+'&timeMax='+tMax.toISOString();
    var res=await fetch(url,{headers:{Authorization:'Bearer '+token}});
    var d=await res.json();
    return d.items||[];
  }catch(e){return [];}
}

// Get next N WEEKDAYS only (Mon-Fri). Saturday and Sunday excluded.
function weekdays(n){
  var days=[];
  var now=new Date();
  var cs=now.toLocaleDateString('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'});
  var parts=cs.split('/');
  var month=parseInt(parts[0])-1;
  var day=parseInt(parts[1]);
  var year=parseInt(parts[2]);
  for(var i=1;days.length<n;i++){
    var d=new Date(Date.UTC(year,month,day+i,17,0,0));
    var dow=d.getDay();
    // Skip Sunday (0) and Saturday (6) — Saturdays reserved for showroom only
    if(dow!==0&&dow!==6)days.push(d);
  }
  return days;
}

function chicagoDateStr(date){return date.toLocaleDateString('en-US',{timeZone:'America/Chicago'});}

function getChicagoHourDecimal(date){
  var h=parseInt(date.toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Chicago'}),10);
  var m=parseInt(date.toLocaleString('en-US',{minute:'2-digit',timeZone:'America/Chicago'}),10);
  return h+m/60;
}

// Returns true if the slot [slotStartH, slotEndH] does NOT overlap any event
// AND has TRAVEL_BUFFER_MIN of clear space before AND after any neighboring event.
function isSlotFree(events,day,slotStartH,slotEndH){
  var dayStr=chicagoDateStr(day);
  var bufferH=TRAVEL_BUFFER_MIN/60;
  for(var i=0;i<events.length;i++){
    var e=events[i];
    if(!e.start)continue;
    // Skip cancelled events
    if(e.status==='cancelled')continue;
    var evStart=new Date(e.start.dateTime||e.start.date);
    var evEnd=new Date(e.end.dateTime||e.end.date);
    if(chicagoDateStr(evStart)!==dayStr)continue;
    var evStartH=getChicagoHourDecimal(evStart);
    var evEndH=getChicagoHourDecimal(evEnd);
    // Pad the EVENT with travel buffer on each side, then check overlap with the proposed slot
    var paddedEvStart=evStartH-bufferH;
    var paddedEvEnd=evEndH+bufferH;
    if(slotStartH<paddedEvEnd&&slotEndH>paddedEvStart)return false;
  }
  return true;
}

// Check if a specific truck has any booking on a given day
function truckHasBookingOnDay(events,day){
  var dayStr=chicagoDateStr(day);
  for(var i=0;i<events.length;i++){
    var e=events[i];
    if(!e.start)continue;
    if(e.status==='cancelled')continue;
    var evStart=new Date(e.start.dateTime||e.start.date);
    if(chicagoDateStr(evStart)===dayStr)return true;
  }
  return false;
}

function fmtDay(d){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'America/Chicago'});}

function fmtTime(h){
  var hour=Math.floor(h);
  var min=Math.round((h-hour)*60);
  var ampm=hour>=12?'PM':'AM';
  var h12=hour%12||12;
  return h12+':'+(min<10?'0'+min:min)+' '+ampm;
}

// For a given Tue/Thu, decide which truck calendar to use for carpet.
// Rule: if Truck 1 is already booked that day, keep using it. Otherwise default to Truck 1.
// (Adolfo can override; this just keeps it consistent.)
function pickCarpetTruckForTueThu(t1Events,t2Events,day){
  if(truckHasBookingOnDay(t1Events,day))return t1Events;
  if(truckHasBookingOnDay(t2Events,day))return t2Events;
  return t1Events; // default to Truck 1
}

function findSlots(t1Events,t2Events,pickupEvents,days,durationHours,type){
  var slots=[];
  // Per scheduling rules: last job must START by 3 PM. Crew may finish later if needed.
  for(var i=0;i<days.length&&slots.length<5;i++){
    var day=days[i];
    var dow=day.getDay();
    if(type==='RUG'&&dow!==2&&dow!==4)continue;
    var isTueThu=(dow===2||dow===4);
    for(var startMin=DAY_OPEN_HOUR*60;startMin/60<=LAST_JOB_START_HOUR&&slots.length<5;startMin+=30){
      var startH=startMin/60;
      var endH=startH+durationHours;
      var free=false;
      if(type==='RUG'){
        // Rug pickups always go on Big Truck / Pickup calendar
        free=isSlotFree(pickupEvents,day,startH,endH);
      } else if(isTueThu){
        // Tue/Thu carpet: only ONE truck runs carpet (the Big Truck / Pickup calendar
        // is doing rug runs, so Truck 1 OR Truck 2 takes the carpet).
        // Pick the consistent truck for this day.
        var carpetEvents=pickCarpetTruckForTueThu(t1Events,t2Events,day);
        free=isSlotFree(carpetEvents,day,startH,endH);
      } else {
        // Mon/Wed/Fri: BOTH Truck 1 and Truck 2 run carpet.
        // Slot is open if EITHER truck has a clear window.
        free=isSlotFree(t1Events,day,startH,endH)||isSlotFree(t2Events,day,startH,endH);
      }
      if(free){
        slots.push({date:fmtDay(day),time:fmtTime(startH),label:fmtDay(day)+' at '+fmtTime(startH)});
        break; // one slot per day to keep options spread out
      }
    }
  }
  return slots;
}

function buildTextSummary(t1Events,t2Events,pickupEvents,days){
  var summary='REAL-TIME CALENDAR AVAILABILITY:\n\nCARPET & UPHOLSTERY CLEANING (slots include 15 min travel buffer between jobs. First job 9 AM, last job starts by 3 PM):\nMon/Wed/Fri: Truck 1 AND Truck 2 both run carpet. Slot open if EITHER truck is free.\nTue/Thu: ONLY ONE truck runs carpet (the Big Truck does rug pickup that day).\n\n';
  days.forEach(function(day){
    var dow=day.getDay();
    var isTueThu=(dow===2||dow===4);
    var morningOpen,afternoonOpen;
    if(isTueThu){
      var carpetEvents=pickCarpetTruckForTueThu(t1Events,t2Events,day);
      morningOpen=isSlotFree(carpetEvents,day,9,12);
      afternoonOpen=isSlotFree(carpetEvents,day,12,16);
    } else {
      morningOpen=isSlotFree(t1Events,day,9,12)||isSlotFree(t2Events,day,9,12);
      afternoonOpen=isSlotFree(t1Events,day,12,16)||isSlotFree(t2Events,day,12,16);
    }
    var parts=[];if(morningOpen)parts.push('morning');if(afternoonOpen)parts.push('afternoon');
    summary+='- '+fmtDay(day)+(isTueThu?' (one truck only)':'')+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
  });
  summary+='\nRUG PICKUP & DELIVERY (Big Truck - Tuesdays & Thursdays only):\n';
  days.filter(function(d){return d.getDay()===2||d.getDay()===4;}).forEach(function(day){
    var mo=isSlotFree(pickupEvents,day,9,12);
    var ao=isSlotFree(pickupEvents,day,12,16);
    var parts=[];if(mo)parts.push('morning');if(ao)parts.push('afternoon');
    summary+='- '+fmtDay(day)+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
  });
  return summary;
}

exports.handler=async function(event){
  var headers={'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if(event.httpMethod==='OPTIONS')return{statusCode:200,headers,body:''};
  try{
    var raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if(!raw)throw new Error('Missing credentials');
    var creds=JSON.parse(raw);
    var token=await getToken(creds);
    var days=weekdays(14);
    var tMin=new Date(days[0]);tMin.setHours(0,0,0,0);
    var tMax=new Date(days[days.length-1]);tMax.setHours(23,59,59,999);
    var results=await Promise.all([getEvents(token,PICKUP_CAL,tMin,tMax),getEvents(token,TRUCK1_CAL,tMin,tMax),getEvents(token,TRUCK2_CAL,tMin,tMax)]);
    var pickupEv=results[0],t1Ev=results[1],t2Ev=results[2];
    var params=event.queryStringParameters||{};
    var duration=params.duration?parseInt(params.duration):null;
    var type=params.type||'CARPET';
    if(duration){
      var durationHours=duration/60;
      var slots=findSlots(t1Ev,t2Ev,pickupEv,days,durationHours,type);
      return{statusCode:200,headers,body:JSON.stringify({slots:slots})};
    }else{
      var summary=buildTextSummary(t1Ev,t2Ev,pickupEv,days.slice(0,10));
      return{statusCode:200,headers,body:JSON.stringify({summary:summary,updated:new Date().toISOString()})};
    }
  }catch(e){return{statusCode:500,headers,body:JSON.stringify({error:e.message})};}
};
