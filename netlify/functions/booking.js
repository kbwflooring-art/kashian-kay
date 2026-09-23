// =========================================================================
// GOOGLE FORM LEAD LOG
// Every submitted booking and contact-form lead is posted to a Google Form,
// which drops it into the linked "Kay Leads" spreadsheet automatically.
// No API key or service account needed — this posts server-side to the Form's
// public response endpoint. Leave LEADS_FORM_ID as '' to turn logging OFF.
// =========================================================================
const LEADS_FORM_ID = '1FAIpQLScqi3pUQzleR9Cjqp47xM-v0_qZcRLPYQl9-AimptqL242AqQ';
const LEADS_FIELDS = {
  date:    'entry.504540383',
  name:    'entry.1979560556',
  email:   'entry.840073386',
  phone:   'entry.1445152854',
  source:  'entry.513223801',
  address: 'entry.1455579471',
  details: 'entry.307016731'
};

// Post one lead to the Google Form. NEVER throws — logging a lead must never
// break the booking/estimate email that has already gone out.
async function logLead(fields) {
  try {
    if (!LEADS_FORM_ID) return; // logging turned off
    const params = new URLSearchParams();
    Object.keys(LEADS_FIELDS).forEach(function (k) {
      if (fields[k]) params.append(LEADS_FIELDS[k], fields[k]);
    });
    await fetch('https://docs.google.com/forms/d/e/' + LEADS_FORM_ID + '/formResponse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
  } catch (e) {
    console.error('Lead log failed (non-fatal):', e.message);
  }
}

function chicagoStamp() {
  return new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
}

exports.handler = async function(event) {
  // CORS headers — allow the chatbot embedded on kashianbros.com (or any domain) to call this function
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };

  try {
    const b = JSON.parse(event.body);
    const {
      name, phone, email, addr, svc, lbl, detail, stairs,
      date, time, selfP, cname, cphone, pets, notes, isChicago
    } = b;

    // Kashian Bros brand colors
    const TEAL = '#5bcdc7';
    const TEAL_LIGHT = '#7ddbd6';
    const TEAL_BG = '#f0fafa';
    const TEAL_BORDER = '#b8eeeb';

    // =========================================================================
    // ESTIMATE / CALLBACK LEAD  (services we do NOT book online, or "contact me")
    // These have no appointment date, so there is no calendar link — just a clean
    // lead email with the customer's info and what they want.
    //
    // >>> CHANGE THIS to whoever should receive estimate leads <<<
    // Currently set to Doug (who already receives the chat-log emails). If in-home
    // estimates are handled by a different person or a shared inbox, update it here.
    // =========================================================================
    if (svc === 'ESTIMATE') {
      const ESTIMATE_RECIPIENTS = ['dstein@kashianbros.com'];

      const leadHtml = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid ${TEAL_BORDER}">
  <div style="background:${TEAL};padding:16px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">📝 New Estimate Request — Kay</h2>
    <p style="color:#c8efed;margin:4px 0 0;font-size:13px">A customer is asking us to reach out</p>
  </div>
  <div style="padding:20px 24px">
    ${isChicago ? `<div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;"><strong>⚠️ Chicago Address</strong></div>` : ''}
    <div style="background:${TEAL_BG};border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;color:#1e293b;line-height:1.8;border:1px solid ${TEAL_BORDER}">
      <strong>👤 Name:</strong> ${name}<br>
      <strong>📞 Phone:</strong> ${phone}<br>
      <strong>📧 Email:</strong> ${email}${addr ? `<br><strong>📍 Address:</strong> ${addr}` : ''}<br>
      <strong>📝 Project:</strong> ${detail || notes || '(none provided)'}
    </div>
    <a href="tel:${(phone || '').replace(/[^0-9+]/g, '')}" style="display:block;background:${TEAL};color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:10px">
      📞 Call ${name}
    </a>
    <a href="mailto:${email}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
      ✉️ Email ${name}
    </a>
  </div>
  <div style="background:${TEAL};padding:10px 24px;font-size:11px;color:#c8efed;text-align:center">
    Kashian Bros Kay — kashianbros.com — (847) 251-1200
  </div>
</div>
</body>
</html>`;

      const leadRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Kay at Kashian Bros <bot@kashianbrosautomation.com>',
          to: ESTIMATE_RECIPIENTS,
          reply_to: email || undefined,
          subject: `New Estimate Request — ${name}`,
          html: leadHtml
        })
      });

      const leadData = await leadRes.json();
      if (!leadRes.ok) throw new Error(JSON.stringify(leadData));

      // Log the lead to the Google Form -> Sheet (non-fatal if it fails)
      await logLead({
        date: chicagoStamp(), name: name, email: email, phone: phone,
        source: 'Contact Form', address: addr, details: detail || notes
      });

      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };
    }

    // =========================================================================
    // BOOKING  (in-home cleaning + rug pickup)
    // Adolfo books the calendar event himself, so this email does NOT build an
    // "Add to Google Calendar" link (that link always landed on the clicker's
    // personal calendar, and it choked on the pickup-window text). Instead the
    // email shows the appointment exactly as the customer chose it and makes the
    // correct target calendar prominent so Adolfo puts it in the right place.
    // =========================================================================

    // Which calendar Adolfo should book this on.
    const calendarName = svc === 'RUG_PICKUP'
      ? 'Rug Pickup & Delivery Calendar (Tues/Thurs)'
      : 'In-Home Cleaning Calendar (Mon-Fri)';

    // A rug whose city wasn't on the standard route comes through flagged for a
    // manual call to set the window. Detect it so we can banner it clearly.
    const isManual = /manual pickup window/i.test(notes || '') || /confirmed by phone/i.test(date || '');

    // --- Build confirm link (sends the customer their confirmation email) ---
    const confirmData = encodeURIComponent(JSON.stringify({
      name, email, lbl, addr, date, time, svc, detail
    }));
    const confirmLink = `https://warm-dolphin-79489e.netlify.app/.netlify/functions/confirm?data=${confirmData}`;

    // --- Banners ---
    const chicagoBanner = isChicago
      ? `<div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;">
           <strong>⚠️ Chicago Address</strong> — confirm any trip charge and book manually on the correct calendar.
         </div>` : '';

    const manualBanner = isManual
      ? `<div style="background:#fef9c3;border:1px solid #f59e0b;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;">
           <strong>⚠️ Manual pickup window</strong> — this address wasn't on the standard route. Call the customer to confirm a pickup window before booking.
         </div>` : '';

    // --- Build HTML email to Adolfo ---
    const htmlEmail = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid ${TEAL_BORDER}">
  <div style="background:${TEAL};padding:16px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">📋 New Booking Request — Kay</h2>
    <p style="color:#c8efed;margin:4px 0 0;font-size:13px">${lbl}</p>
  </div>
  <div style="padding:20px 24px">
    ${chicagoBanner}
    ${manualBanner}
    <div style="background:#eff6ff;border:2px solid #60a5fa;border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:14px;color:#1e40af;line-height:1.6;">
      <strong>📅 BOOK ON THIS CALENDAR:</strong><br>${calendarName}<br>
      <strong>🕒 Appointment:</strong> ${date || '(none given)'}
    </div>
    <div style="background:${TEAL_BG};border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;color:#1e293b;line-height:1.8;border:1px solid ${TEAL_BORDER}">
      <strong>👤 Name:</strong> ${name}<br>
      <strong>📞 Phone:</strong> ${phone}<br>
      <strong>📧 Email:</strong> ${email}<br>
      <strong>📍 Address:</strong> ${addr}<br>
      <strong>${svc === 'CARPET' ? '🛋️ Rooms' : svc === 'UPHOLSTERY' ? '🪑 Items' : '🏠 Rugs'}:</strong> ${detail}
      ${stairs ? `<br><strong>🪜 Stairs:</strong> ${stairs}` : ''}
      ${pets ? `<br><strong>🐾 Pets:</strong> ${pets}` : ''}
      ${time ? `<br><strong>⏰ Time Preference:</strong> ${time}` : ''}
      <br><strong>🔑 On-site:</strong> ${selfP ? 'Customer will be present' : `Contact: ${cname} — ${cphone}`}
      ${notes ? `<br><strong>📝 Notes:</strong> ${notes}` : ''}
    </div>
    <a href="${confirmLink}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:12px">
      ✅ Confirm This Booking — Send Customer Confirmation
    </a>
    <p style="font-size:11.5px;color:#94a3b8;text-align:center;margin:0">
      Clicking Confirm will automatically send ${name} a confirmation email. Add the appointment to the calendar shown above.
    </p>
  </div>
  <div style="background:${TEAL};padding:10px 24px;font-size:11px;color:#c8efed;text-align:center">
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

    // Log the lead to the Google Form -> Sheet (non-fatal if it fails)
    await logLead({
      date: chicagoStamp(), name: name, email: email, phone: phone,
      source: 'Booking - ' + (lbl || ''), address: addr, details: detail
    });

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true }) };

  } catch(e) {
    console.error('Booking error:', e);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) };
  }
};
