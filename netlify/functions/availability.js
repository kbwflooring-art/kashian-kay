const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const CALENDARS = {
  pickup: {
    id: 'a19e4f2968fbefb546c8e0177788a8a3d6efcf2ce2eb251444197b4a84379e4a@group.calendar.google.com',
    name: 'Pickup & Delivery',
    days: [2, 4] // Tuesday=2, Thursday=4 only
  },
  truck1: {
    id: '9c77e8f3275959d025aacba0b2a15a3235e8e8ee02ed36d965ce6950304c22f1@group.calendar.google.com',
    name: 'Truck 1',
    days: [1, 2, 3, 4, 5] // Mon-Fri
  },
  truck2: {
    id: '805de988185d3df181289a2bcdd242110c6e5ca38fb00424a2dab03af1ca4114@group.calendar.google.com',
    name: 'Truck 2',
    days: [1, 2, 3, 4, 5] // Mon-Fri
  }
};

// Business hours
const FIRST_JOB = 9;   // 9am
const LAST_JOB = 15;   // 3pm (last job start)
const LAST_JOB_SMALL = 16; // 4pm for small jobs

function getNextDays(numDays) {
  const days = [];
  const now = new Date();
  // Use Chicago time
  const chicagoNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  let d = new Date(chicagoNow);
  d.setHours(0, 0, 0, 0);

  // Start from tomorrow
  d.setDate(d.getDate() + 1);

  let count = 0;
  while (count < numDays) {
    const dow = d.getDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) { // Skip weekends
      days.push(new Date(d));
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    timeZone: 'America/Chicago'
  });
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    timeZone: 'America/Chicago'
  });
}

async function getCalendarEvents(calendar, calId, timeMin, timeMax) {
  try {
    const res = await calendar.events.list({
      calendarId: calId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    return res.data.items || [];
  } catch (e) {
    console.error('Calendar fetch error:', e.message);
    return [];
  }
}

function getSlotStatus(events, day) {
  // Check morning (9am-12pm) and afternoon (12pm-4pm) slots
  const morningStart = new Date(day);
  morningStart.setHours(FIRST_JOB, 0, 0, 0);
  const noon = new Date(day);
  noon.setHours(12, 0, 0, 0);
  const afternoonEnd = new Date(day);
  afternoonEnd.setHours(LAST_JOB_SMALL, 0, 0, 0);

  let morningEvents = 0;
  let afternoonEvents = 0;

  events.forEach(evt => {
    const start = new Date(evt.start.dateTime || evt.start.date);
    const end = new Date(evt.end.dateTime || evt.end.date);

    // Check if event overlaps morning
    if (start < noon && end > morningStart) morningEvents++;
    // Check if event overlaps afternoon
    if (start < afternoonEnd && end > noon) afternoonEvents++;
  });

  // Assume 2 jobs max per half-day slot as "busy"
  return {
    morningOpen: morningEvents < 2,
    afternoonOpen: afternoonEvents < 2,
    morningCount: morningEvents,
    afternoonCount: afternoonEvents
  };
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse service account credentials
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing credentials' }) };
    }

    const credentials = JSON.parse(serviceAccountJson);
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    const authClient = await auth.getClient();
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Get next 10 weekdays
    const days = getNextDays(10);
    const timeMin = days[0];
    const timeMax = new Date(days[days.length - 1]);
    timeMax.setHours(23, 59, 59, 999);

    // Fetch all calendar events in parallel
    const [pickupEvents, truck1Events, truck2Events] = await Promise.all([
      getCalendarEvents(calendar, CALENDARS.pickup.id, timeMin, timeMax),
      getCalendarEvents(calendar, CALENDARS.truck1.id, timeMin, timeMax),
      getCalendarEvents(calendar, CALENDARS.truck2.id, timeMin, timeMax)
    ]);

    // Build availability summary
    const availability = {
      carpet_upholstery: [],
      pickup_delivery: []
    };

    days.forEach(day => {
      const dow = day.getDay();
      const dateStr = formatDate(day);
      const dateShort = formatDateShort(day);

      // Carpet/Upholstery — needs at least one truck available (Mon-Fri)
      const t1 = getSlotStatus(
        truck1Events.filter(e => {
          const s = new Date(e.start.dateTime || e.start.date);
          return s.toDateString() === day.toDateString();
        }), day
      );
      const t2 = getSlotStatus(
        truck2Events.filter(e => {
          const s = new Date(e.start.dateTime || e.start.date);
          return s.toDateString() === day.toDateString();
        }), day
      );

      const carpetMorning = t1.morningOpen || t2.morningOpen;
      const carpetAfternoon = t1.afternoonOpen || t2.afternoonOpen;

      availability.carpet_upholstery.push({
        date: dateStr,
        dateShort,
        dow,
        morning: carpetMorning,
        afternoon: carpetAfternoon,
        available: carpetMorning || carpetAfternoon
      });

      // Pickup/Delivery — Tues and Thurs only
      if (dow === 2 || dow === 4) {
        const pu = getSlotStatus(
          pickupEvents.filter(e => {
            const s = new Date(e.start.dateTime || e.start.date);
            return s.toDateString() === day.toDateString();
          }), day
        );
        availability.pickup_delivery.push({
          date: dateStr,
          dateShort,
          dow,
          morning: pu.morningOpen,
          afternoon: pu.afternoonOpen,
          available: pu.morningOpen || pu.afternoonOpen
        });
      }
    });

    // Build human-readable summary for Kay
    const carpetOpen = availability.carpet_upholstery.filter(d => d.available);
    const pickupOpen = availability.pickup_delivery.filter(d => d.available);

    let summary = 'CURRENT AVAILABILITY:\n\n';

    summary += 'CARPET & UPHOLSTERY CLEANING (Mon-Fri):\n';
    if (carpetOpen.length === 0) {
      summary += 'Fully booked for the next 2 weeks. Suggest calling (847) 251-1200.\n';
    } else {
      carpetOpen.slice(0, 6).forEach(d => {
        const slots = [];
        if (d.morning) slots.push('Morning');
        if (d.afternoon) slots.push('Afternoon');
        summary += `- ${d.date}: ${slots.join(' and ')} available\n`;
      });
    }

    summary += '\nRUG PICKUP & DELIVERY (Tuesdays & Thursdays only):\n';
    if (pickupOpen.length === 0) {
      summary += 'Fully booked for the next 2 weeks. Suggest calling (847) 251-1200.\n';
    } else {
      pickupOpen.slice(0, 4).forEach(d => {
        const slots = [];
        if (d.morning) slots.push('Morning');
        if (d.afternoon) slots.push('Afternoon');
        summary += `- ${d.date}: ${slots.join(' and ')} available\n`;
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary,
        availability,
        updated: new Date().toISOString()
      })
    };

  } catch (e) {
    console.error('Availability error:', e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
