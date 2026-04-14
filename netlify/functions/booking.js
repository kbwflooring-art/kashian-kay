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

    // --- Build HTML email ---
    const chicagoBanner = isChicago
      ? `<div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;">
           <strong>⚠️ Chicago Address</strong> — Please book this manually on the appropriate calendar.
         </div>` : '';

    const htmlEmail = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2eef5">
  <div style="background:#1a5f7a;padding:16px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">📋 New Booking Request — Kay</h2>
    <p style="color:#a8d8ea;margin:4px 0 0;font-size:13px">${lbl}</p>
  </div>
  <div style="padding:20px 24px">
    ${chicagoBanner}
    <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;color:#1e293b;line-height:1.8">
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
    <a href="${calLink}" style="display:block;background:#1a5f7a;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:12px">
      ➕ Add to Google Calendar
    </a>
    <p style="font-size:11.5px;color:#94a3b8;text-align:center;margin:0">
      Clicking the button above will open Google Calendar with all details pre-filled.<br>
      Please confirm the appointment with the customer at <strong>${email}</strong>.
    </p>
  </div>
  <div style="background:#f1f5f9;padding:10px 24px;font-size:11px;color:#94a3b8;text-align:center">
    Kashian Bros Kay — kashianbros.com — (847) 251-1200
  </div>
</div>
</body>
</html>`;

    // --- Send via Resend ---
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

    // --- Send customer confirmation email ---
    const timing = (() => {
      const now = new Date();
      const day = now.getDay(), hr = now.getHours();
      if (day === 0) return 'Our team will confirm your booking first thing Monday morning.';
      if (day === 6 && hr < 10) return 'Our team opens at 10am on Saturdays and will confirm your booking then.';
      if (day === 6 && hr < 15) return 'Adolfo will confirm your booking within about an hour, before we close at 3pm today.';
      if (day === 6) return 'Our Saturday hours have ended. Adolfo will confirm your booking first thing Monday morning.';
      if (hr < 9) return 'Our team starts at 9am. Adolfo will confirm your booking by then this morning.';
      if (hr < 17) return 'Adolfo will confirm your booking within about an hour, and always before 5pm today.';
      return 'Our team has closed for the day. Adolfo will confirm your booking first thing tomorrow morning.';
    })();

    const customerEmail = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2eef5">
  <div style="background:#1a5f7a;padding:16px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">Your Booking Request is Confirmed!</h2>
    <p style="color:#a8d8ea;margin:4px 0 0;font-size:13px">Kashian Bros - Family owned since 1910</p>
  </div>
  <div style="padding:20px 24px">
    <p style="font-size:14px;color:#1e293b;margin-bottom:16px">Hi ${b.name.split(' ')[0]}, thank you for reaching out! We have received your booking request and our team will be in touch shortly to confirm your appointment.</p>
    <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;color:#1e293b;line-height:1.8">
      <strong>Service:</strong> ${b.lbl}<br>
      <strong>Address:</strong> ${b.addr}<br>
      <strong>Requested Date:</strong> ${b.date}<br>
      <strong>Time Preference:</strong> ${b.time}
    </div>
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#15803d">
      <strong>${timing}</strong>
    </div>
    <p style="font-size:13px;color:#475569;margin-bottom:4px">Questions? We are happy to help:</p>
    <p style="font-size:13px;color:#1e293b;margin:0"><strong>(847) 251-1200</strong> &nbsp;|&nbsp; <strong>info@kashianbros.com</strong></p>
  </div>
  <div style="background:#f1f5f9;padding:10px 24px;font-size:11px;color:#94a3b8;text-align:center">
    Kashian Bros &bull; kashianbros.com &bull; (847) 251-1200
  </div>
</div>
</body>
</html>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'Kay at Kashian Bros <bot@kashianbrosautomation.com>',
        to: [b.email],
        subject: `Your Kashian Bros booking request - ${b.lbl} on ${b.date}`,
        html: customerEmail
      })
    });
    if (!res.ok) throw new Error(JSON.stringify(resData));

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch(e) {
    console.error('Booking error:', e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
