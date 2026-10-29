// sms-auto-daytime.mjs
// Kashian Bros SMS reminders — AUTOMATIC daytime runner. Separate from Kay.
// Netlify runs this on its own every 30 minutes. Between 8:00 AM and 8:00 PM Chicago
// time it runs, in order:
//   1) sms-send-confirmations  (calendar TXT auto-fill + confirmation texts)
//   2) sms-check-reschedules   (reschedule notices)
// Outside those hours it does nothing. It calls the same functions as your manual
// links, so test mode and every other safety rule still apply.
// Results show up in Netlify -> Logs -> Functions -> sms-auto-daytime.

function chicagoHour(){return parseInt(new Date().toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Chicago'}),10)%24;}

export default async (req, context) => {
  var h=chicagoHour();
  if(h<8||h>=20){console.log('Outside 8 AM–8 PM Chicago (hour '+h+') — nothing to do.');return new Response('skipped');}
  var base=(context&&context.site&&context.site.url)||process.env.URL||'https://warm-dolphin-79489e.netlify.app';
  var key=process.env.SMS_ADMIN_KEY;
  if(!key){console.log('Missing SMS_ADMIN_KEY');return new Response('missing key',{status:500});}
  var jobs=['sms-send-confirmations','sms-check-reschedules'];
  for(var i=0;i<jobs.length;i++){
    try{
      var res=await fetch(base+'/.netlify/functions/'+jobs[i]+'?key='+encodeURIComponent(key));
      console.log('--- '+jobs[i]+' ('+res.status+') ---\n'+(await res.text()));
    }catch(e){console.log(jobs[i]+' failed: '+e.message);}
  }
  return new Response('ok');
};

// Every 30 minutes, only during the UTC hours that can be 8 AM–8 PM in Chicago
// (covers both daylight and standard time; the hour check above does the rest).
export const config = { schedule: "0,30 0-2,13-23 * * *" };
