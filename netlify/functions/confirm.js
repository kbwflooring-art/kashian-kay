exports.handler = async function(event) {
  try {
    const raw = event.queryStringParameters && event.queryStringParameters.data;
    if (!raw) return { statusCode: 400, contentType: 'text/html', body: '<h2>Invalid confirmation link.</h2>' };

    const b = JSON.parse(decodeURIComponent(raw));
    const { name, email, lbl, addr, date, time } = b;

    // --- Send confirmation email to customer ---
    const customerHtml = `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2eef5">
  <div style="background:#1a5f7a;padding:16px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">Your Appointment is Confirmed!</h2>
    <p style="color:#a8d8ea;margin:4px 0 0;font-size:13px">Kashian Bros - Family owned since 1910</p>
  </div>
  <div style="padding:20px 24px">
    <p style="font-size:14px;color:#1e293b;margin-bottom:16px">Hi ${name.split(' ')[0]}, great news — your appointment has been confirmed! We look forward to seeing you.</p>
    <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:16px;font-size:13px;color:#1e293b;line-height:1.8">
      <strong>Service:</strong> ${lbl}<br>
      <strong>Address:</strong> ${addr}<br>
      <strong>Date:</strong> ${date}<br>
      <strong>Time:</strong> ${time}
    </div>
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#15803d">
      <strong>Your appointment is confirmed. Our crew will be there as scheduled!</strong>
    </div>
    <p style="font-size:13px;color:#475569;margin-bottom:4px">Questions before your appointment?</p>
    <p style="font-size:13px;color:#1e293b;margin:0"><strong>(847) 251-1200</strong> &nbsp;|&nbsp; <strong>info@kashianbros.com</strong></p>
  </div>
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
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:40px;text-align:center">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2eef5">
  <div style="font-size:48px;margin-bottom:16px">✅</div>
  <h2 style="color:#15803d;margin-bottom:8px">Booking Confirmed!</h2>
  <p style="color:#475569;font-size:14px;margin-bottom:16px">A confirmation email has been sent to <strong>${email}</strong></p>
  <div style="background:#f8fafc;border-radius:8px;padding:14px;font-size:13px;color:#1e293b;line-height:1.8;text-align:left">
    <strong>Customer:</strong> ${name}<br>
    <strong>Service:</strong> ${lbl}<br>
    <strong>Date:</strong> ${date}<br>
    <strong>Time:</strong> ${time}
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
