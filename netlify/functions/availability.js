var crypto = require('crypto');

var PICKUP_CAL = 'a19e4f2968fbefb546c8e0177788a8a3d6efcf2ce2eb251444197b4a84379e4a@group.calendar.google.com';
var TRUCK1_CAL = '9c77e8f3275959d025aacba0b2a15a3235e8e8ee02ed36d965ce6950304c22f1@group.calendar.google.com';
var TRUCK2_CAL = '805de988185d3df181289a2bcdd242110c6e5ca38fb00424a2dab03af1ca4114@group.calendar.google.com';

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

function weekdays(n){
  var days=[],d=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Chicago'}));
  d.setHours(0,0,0,0);d.setDate(d.getDate()+1);
  while(days.length<n){if(d.getDay()!==0&&d.getDay()!==6)days.push(new Date(d));d.setDate(d.getDate()+1);}
  return days;
}

function chicagoDateStr(date){return date.toLocaleDateString('en-US',{timeZone:'America/Chicago'});}

function getChicagoHourDecimal(date){
  var h=parseInt(date.toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Chicago'}),10);
  var m=parseInt(date.toLocaleString('en-US',{minute:'2-digit',timeZone:'America/Chicago'}),10);
  return h+m/60;
}

function isSlotFree(events,day,slotStartH,slotEndH){
  var dayStr=chicagoDateStr(day);
  for(var i=0;i<events.length;i++){
    var e=events[i];
    if(!e.start)continue;
    var evStart=new Date(e.start.dateTime||e.start.date);
    var evEnd=new Date(e.end.dateTime||e.end.date);
    if(chicagoDateStr(evStart)!==dayStr)continue;
    var evStartH=getChicagoHourDecimal(evStart);
    var evEndH=getChicagoHourDecimal(evEnd);
    if(slotStartH<evEndH&&slotEndH>evStartH)return false;
  }
  return true;
}

function fmtDay(d){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',timeZone:'America/Chicago'});}

function fmtTime(h){
  var hour=Math.floor(h);
  var min=Math.round((h-hour)*60);
  var ampm=hour>=12?'PM':'AM';
  var h12=hour%12||12;
  return h12+':'+(min<10?'0'+min:min)+' '+ampm;
}

function findSlots(t1Events,t2Events,days,durationHours,type){
  var slots=[];
  var lastStart=durationHours>2?15:16;
  for(var i=0;i<days.length&&slots.length<5;i++){
    var day=days[i];
    var dow=day.getDay();
    if(type==='RUG'&&dow!==2&&dow!==4)continue;
    var isTueThu=(dow===2||dow===4);
    var useBothTrucks=(type==='CARPET'&&!isTueThu);
    for(var startMin=9*60;startMin+durationHours*60<=lastStart*60&&slots.length<5;startMin+=30){
      var startH=startMin/60;
      var endH=startH+durationHours;
      var free=false;
      if(type==='RUG'){free=isSlotFree(t1Events,day,startH,endH);}
      else if(useBothTrucks){free=isSlotFree(t1Events,day,startH,endH)||isSlotFree(t2Events,day,startH,endH);}
      else{free=isSlotFree(t1Events,day,startH,endH);}
      if(free){
        slots.push({date:fmtDay(day),time:fmtTime(startH),label:fmtDay(day)+' at '+fmtTime(startH)});
        break; // one slot per day
      }
    }
  }
  return slots;
}

function buildTextSummary(t1Events,t2Events,pickupEvents,days){
  var summary='REAL-TIME CALENDAR AVAILABILITY:\n\nCARPET & UPHOLSTERY CLEANING:\nMon/Wed/Fri: Truck 1 AND Truck 2 available. Slot is open if EITHER truck has no overlapping jobs.\nTue/Thu: ONLY Truck 1 available for carpet (Truck 2 crew runs Big Truck for rug pickup).\n\n';
  days.forEach(function(day){
    var dow=day.getDay();
    var isTueThu=(dow===2||dow===4);
    var morningOpen,afternoonOpen;
    if(isTueThu){morningOpen=isSlotFree(t1Events,day,9,12);afternoonOpen=isSlotFree(t1Events,day,12,16);}
    else{morningOpen=isSlotFree(t1Events,day,9,12)||isSlotFree(t2Events,day,9,12);afternoonOpen=isSlotFree(t1Events,day,12,16)||isSlotFree(t2Events,day,12,16);}
    var parts=[];if(morningOpen)parts.push('morning');if(afternoonOpen)parts.push('afternoon');
    summary+='- '+fmtDay(day)+(isTueThu?' (Truck 1 only)':'')+': '+(parts.length?parts.join(' and ')+' available':'fully booked')+'\n';
  });
  summary+='\nRUG PICKUP & DELIVERY (Big Truck - Tuesdays & Thursdays only):\n';
  days.filter(function(d){return d.getDay()===2||d.getDay()===4;}).forEach(function(day){
    var mo=isSlotFree(pickupEvents,day,9,12);var ao=isSlotFree(pickupEvents,day,12,16);
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
      var slots=findSlots(type==='RUG'?pickupEv:t1Ev,t2Ev,days,durationHours,type);
      return{statusCode:200,headers,body:JSON.stringify({slots:slots})};
    }else{
      var summary=buildTextSummary(t1Ev,t2Ev,pickupEv,days.slice(0,10));
      return{statusCode:200,headers,body:JSON.stringify({summary:summary,updated:new Date().toISOString()})};
    }
  }catch(e){return{statusCode:500,headers,body:JSON.stringify({error:e.message})};}
};
