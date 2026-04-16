exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  try {
    const b = JSON.parse(event.body);
    const {
      name, phone, email, addr, svc, lbl, detail, stairs,
      date, time, selfP, cname, cphone, pets, notes, isChicago
    } = b;

    // --- Build Google Calendar one-click link ---
    const parsedDate = new Date(date + " 09:00:00");
    const isValid = !isNaN(parsedDate);
    const pad = n => String(n).padStart(2, '0');
    const fmt = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    const startTime = isValid ? fmt(parsedDate) : '';
    const endDate = isValid ? new Date(parsedDate.getTime() + 2 * 60 * 60 * 1000) : null;
    const endTime = endDate ? fmt(endDate) : '';

    const calTitle = encodeURIComponent(`${lbl} - ${name}`);
    const calDetails = encodeURIComponent(
      `Service: ${lbl}\nCustomer: ${name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${addr}\n` +
      (svc === 'CARPET' ? `Rooms: ${detail}${stairs ? '\nStairs: ' + stairs : ''}` :
       svc === 'UPHOLSTERY' ? `Items: ${detail}` : `Rugs: ${detail}`) +
      `\nPets: ${pets}${notes ? '\nNotes: ' + notes : ''}\nTime Pref: ${time}\nOn-site: ${selfP ? 'Customer present' : 'Contact: ' + cname + ' ' + cphone}`
    );
    const calLocation = encodeURIComponent(addr);
    const calDates = isValid ? `${startTime}/${endTime}` : '';
    const calLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${calDates}&details=${calDetails}&location=${calLocation}`;

    const calendarName = svc === 'RUG_PICKUP'
      ? 'Rug Pickup & Delivery Calendar (Tues/Thurs)'
      : 'In-Home Cleaning Calendar (Mon-Fri)';

    // --- Build confirm link ---
    const confirmData = encodeURIComponent(JSON.stringify({
      name, email, lbl, addr, date, time, svc
    }));
    const confirmLink = `https://warm-dolphin-79489e.netlify.app/.netlify/functions/confirm?data=${confirmData}`;

    // --- Chicago banner ---
    const chicagoBanner = isChicago
      ? `<div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;">
           <strong>⚠️ Chicago Address</strong> — Please book this manually on the appropriate calendar.
         </div>` : '';

    // Kashian Bros brand colors
    const TEAL = '#0d7a6e';
    const TEAL_LIGHT = '#1aab9b';
    const TEAL_BG = '#f0fbf9';
    const TEAL_BORDER = '#9de0d8';

    // --- Build HTML email to Adolfo ---
    const htmlEmail = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid ${TEAL_BORDER}">
  <div style="background:${TEAL};padding:16px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">📋 New Booking Request — Kay</h2>
    <p style="color:#a8e6e0;margin:4px 0 0;font-size:13px">${lbl}</p>
  </div>
  <div style="padding:20px 24px">
    ${chicagoBanner}
    <div style="background:${TEAL_BG};border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;color:#1e293b;line-height:1.8;border:1px solid ${TEAL_BORDER}">
      <strong>📅 Calendar:</strong> ${calendarName}<br>
      <strong>👤 Name:</strong> ${name}<br>
      <strong>📞 Phone:</strong> ${phone}<br>
      <strong>📧 Email:</strong> ${email}<br>
      <strong>📍 Address:</strong> ${addr}<br>
      <strong>${svc === 'CARPET' ? '🛋️ Rooms' : svc === 'UPHOLSTERY' ? '🪑 Items' : '🏠 Rugs'}:</strong> ${detail}
      ${stairs ? `<br><strong>🪜 Stairs:</strong> ${stairs}` : ''}
      <br><strong>🐾 Pets:</strong> ${pets}<br>
      <strong>📆 Requested Date:</strong> ${date}<br>
      <strong>⏰ Time Preference:</strong> ${time}<br>
      <strong>🔑 On-site:</strong> ${selfP ? 'Customer will be present' : `Contact: ${cname} — ${cphone}`}
      ${notes ? `<br><strong>📝 Notes:</strong> ${notes}` : ''}
    </div>
    <a href="${calLink}" style="display:block;background:${TEAL};color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:12px">
      ⭐ Add to Google Calendar
    </a>
    <a href="${confirmLink}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:12px">
      ✅ Confirm This Booking — Send Customer Confirmation
    </a>
    <p style="font-size:11.5px;color:#94a3b8;text-align:center;margin:0">
      Clicking Confirm will automatically send ${name} a confirmation email.
    </p>
  </div>
  <div style="background:${TEAL};padding:10px 24px;font-size:11px;color:#a8e6e0;text-align:center">
    Kashian Bros Kay — kashianbros.com — (847) 251-1200
  </div>
</div>
</body>
</html>`;

    // --- Send to Adolfo via Resend ---
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Kay at Kashian Bros <bot@kashianbrosautomation.com>',
        to: ['arodriguez@kashianbros.com'],
        subject: `New ${lbl} Booking — ${name} — ${date}`,
        html: htmlEmail
      })
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(resData));

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch(e) {
    console.error('Booking error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
