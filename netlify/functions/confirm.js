exports.handler = async function(event) {
  try {
    const raw = event.queryStringParameters && event.queryStringParameters.data;
    if (!raw) return { statusCode: 400, contentType: 'text/html', body: '<h2>Invalid confirmation link.</h2>' };
    const b = JSON.parse(decodeURIComponent(raw));
    const { name, email, lbl, addr, date, time, svc, detail } = b;

    // Brand colors (match the Kay chatbot)
    const TEAL = '#5bcdc7';
    const TEAL_BG = '#f0fafa';
    const TEAL_BORDER = '#b8eeeb';
    const DARK = '#0e7490';

    // Service-specific label for the job details row
    const detailLabel = svc === 'CARPET' ? 'Rooms / Items'
      : svc === 'UPHOLSTERY' ? 'Items'
      : svc === 'RUG_PICKUP' ? 'Rugs'
      : 'Details';

    // Optional job details block — only show if we have something
    const detailBlock = detail
      ? `<tr><td style="padding:6px 0;color:#475569;width:120px;vertical-align:top"><strong>${detailLabel}</strong></td><td style="padding:6px 0;color:#1e293b">${detail}</td></tr>`
      : '';

    // --- Send confirmation email to customer ---
    const customerHtml = `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid ${TEAL_BORDER};box-shadow:0 2px 8px rgba(0,0,0,0.04)">

  <!-- Header -->
  <div style="background:${TEAL};padding:20px 24px">
    <h2 style="color:#111;margin:0;font-size:20px;font-weight:700;letter-spacing:-0.01em">Your Appointment is Confirmed</h2>
    <p style="color:#1a1a1a;margin:4px 0 0;font-size:13px;opacity:0.85">Kashian Bros — Family owned since 1910</p>
  </div>

  <!-- Body -->
  <div style="padding:24px">
    <p style="font-size:14.5px;color:#1e293b;margin:0 0 18px;line-height:1.55">Hi ${name.split(' ')[0]}, great news — your appointment has been confirmed! We look forward to seeing you.</p>

    <!-- Appointment details table -->
    <div style="background:${TEAL_BG};border:1px solid ${TEAL_BORDER};border-radius:8px;padding:16px 18px;margin-bottom:18px">
      <table style="width:100%;font-size:13.5px;line-height:1.5;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#475569;width:120px"><strong>Service</strong></td><td style="padding:6px 0;color:#1e293b">${lbl}</td></tr>
        <tr><td style="padding:6px 0;color:#475569;vertical-align:top"><strong>Address</strong></td><td style="padding:6px 0;color:#1e293b">${addr}</td></tr>
        <tr><td style="padding:6px 0;color:#475569"><strong>When</strong></td><td style="padding:6px 0;color:#1e293b"><strong>${date}</strong></td></tr>
        ${detailBlock}
      </table>
    </div>

    <!-- Confirmation banner -->
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:18px;font-size:13.5px;color:#15803d;text-align:center">
      <strong>Your appointment is confirmed. Our crew will be there as scheduled.</strong>
    </div>

    <!-- Contact -->
    <p style="font-size:13px;color:#475569;margin:0 0 4px">Questions before your appointment?</p>
    <p style="font-size:13.5px;color:#1e293b;margin:0">
      <strong style="color:${DARK}">(847) 251-1200</strong>
      &nbsp;|&nbsp;
      <a href="mailto:info@kashianbros.com" style="color:${DARK};text-decoration:none"><strong>info@kashianbros.com</strong></a>
    </p>
  </div>

  <!-- Services footer -->
  <div style="background:${TEAL_BG};padding:16px 24px;border-top:1px solid ${TEAL_BORDER}">
    <p style="font-size:12px;color:#475569;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;text-align:center">Kashian Bros Also Offers</p>
    <p style="font-size:13px;color:#1e293b;margin:0;text-align:center;line-height:1.55">Custom Carpet &amp; Area Rugs &nbsp;•&nbsp; Hardwood Floor Refinishing &nbsp;•&nbsp; Kitchen &amp; Bathroom Remodeling</p>
    <p style="font-size:12px;color:#475569;margin:6px 0 0;text-align:center"><a href="https://kashianbros.com" style="color:${DARK};text-decoration:none">Visit kashianbros.com to explore</a></p>
  </div>

  <!-- Bottom address strip -->
  <div style="background:#f1f5f9;padding:10px 24px;font-size:11px;color:#94a3b8;text-align:center">
    Kashian Bros &bull; kashianbros.com &bull; (847) 251-1200
  </div>
</div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Kay at Kashian Bros <bot@kashianbrosautomation.com>',
        to: [email],
        subject: `Your ${lbl} appointment is confirmed — Kashian Bros`,
        html: customerHtml
      })
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(resData));

    // Return a success page that Adolfo sees in his browser after clicking
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f1f5f9;padding:40px;text-align:center">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid ${TEAL_BORDER}">
  <div style="font-size:48px;margin-bottom:16px">✅</div>
  <h2 style="color:#15803d;margin-bottom:8px">Booking Confirmed!</h2>
  <p style="color:#475569;font-size:14px;margin-bottom:16px">A confirmation email has been sent to <strong>${email}</strong></p>
  <div style="background:${TEAL_BG};border:1px solid ${TEAL_BORDER};border-radius:8px;padding:14px;font-size:13px;color:#1e293b;line-height:1.8;text-align:left">
    <strong>Customer:</strong> ${name}<br>
    <strong>Service:</strong> ${lbl}<br>
    <strong>When:</strong> ${date}
    ${detail ? `<br><strong>${detailLabel}:</strong> ${detail}` : ''}
  </div>
</div>
</body>
</html>`
    };
  } catch(e) {
    console.error('Confirm error:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: '<h2>Something went wrong. Please email the customer directly.</h2><p>' + e.message + '</p>'
    };
  }
};
