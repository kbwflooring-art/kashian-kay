// sms-auto-reminders.mjs
// Kashian Bros SMS reminders — AUTOMATIC 3:30 PM reminder runner. Separate from Kay.
// Netlify runs this on its own once a day and it sends the evening-before reminders
// at 3:30 PM Chicago time (so customers can still call the office if they need to).
// Netlify schedules run on UTC, which shifts with daylight saving time, so this is
// scheduled at both possible UTC times and only proceeds when it is the 3 PM hour
// in Chicago. Reminders are never sent twice for the same appointment.
// It calls the same function as your manual link, so test mode still applies.
// Results show up in Netlify -> Logs -> Functions -> sms-auto-reminders.

function chicagoHour(){return parseInt(new Date().toLocaleString('en-US',{hour:'numeric',hour12:false,timeZone:'America/Chicago'}),10)%24;}

export default async (req, context) => {
  var h=chicagoHour();
  if(h!==15){console.log('Not 3 PM hour in Chicago (hour '+h+') — skipping this run.');return new Response('skipped');}
  var base=(context&&context.site&&context.site.url)||process.env.URL||'https://warm-dolphin-79489e.netlify.app';
  var key=process.env.SMS_ADMIN_KEY;
  if(!key){console.log('Missing SMS_ADMIN_KEY');return new Response('missing key',{status:500});}
  try{
    var res=await fetch(base+'/.netlify/functions/sms-send-reminders?key='+encodeURIComponent(key));
    console.log('--- sms-send-reminders ('+res.status+') ---\n'+(await res.text()));
  }catch(e){console.log('sms-send-reminders failed: '+e.message);}
  return new Response('ok');
};

// 20:30 UTC = 3:30 PM Chicago in daylight time; 21:30 UTC = 3:30 PM in standard time.
export const config = { schedule: "30 20,21 * * *" };
