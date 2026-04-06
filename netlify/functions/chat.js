exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  try {
    const body = JSON.parse(event.body);

    // --- Call Anthropic API ---
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const reply = data.content && data.content[0] ? data.content[0].text : '';

    // --- Detect error / fallback responses ---
    const errorPhrases = [
      'i had trouble with that',
      'please call (847)',
      'i am having trouble connecting',
      'i\'m having trouble',
      'i don\'t have that information',
      'i\'m not sure about that',
      'i cannot help with that'
    ];
    const isError = errorPhrases.some(p => reply.toLowerCase().includes(p));

    // --- Get last customer message ---
    const messages = body.messages || [];
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    const customerMsg = lastUser ? lastUser.content : '(unknown)';

    // --- Build audit email ---
    const flagStyle = isError
      ? 'background:#fee2e2;border-left:4px solid #dc2626;padding:12px 14px;border-radius:6px;'
      : 'background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 14px;border-radius:6px;';
    const flagLabel = isError
      ? '<span style="color:#dc2626;font-weight:700;font-size:12px;">⚠️ FLAGGED — Needs Review</span>'
      : '<span style="color:#16a34a;font-weight:700;font-size:12px;">✅ Normal Response</span>';

    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const msgCount = messages.length;

    const htmlEmail = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2eef5">
  <div style="background:${isError ? '#dc2626' : '#1a5f7a'};padding:14px 24px">
    <h2 style="color:#fff;margin:0;font-size:17px">
      ${isError ? '⚠️ Kay Audit — Flagged Response' : '📋 Kay Audit — Conversation Log'}
    </h2>
    <p style="color:${isError ? '#fecaca' : '#a8d8ea'};margin:4px 0 0;font-size:12px">${timestamp} · Message ${msgCount} in session</p>
  </div>
  <div style="padding:20px 24px">

    <div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">Customer Asked</div>
      <div style="background:#f8fafc;border-radius:6px;padding:10px 14px;font-size:13px;color:#1e293b;line-height:1.6">${customerMsg}</div>
    </div>

    <div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">Kay Responded</div>
      <div style="${flagStyle}">
        ${flagLabel}<br><br>
        <span style="font-size:13px;color:#1e293b;line-height:1.6">${reply.replace(/\n/g, '<br>')}</span>
      </div>
    </div>

    ${isError ? `
    <div style="background:#fef9c3;border:1px solid #fcd34d;border-radius:6px;padding:10px 14px;font-size:12.5px;color:#92400e;margin-bottom:14px">
      <strong>Action needed:</strong> Kay gave an error or fallback response. Review the conversation and consider updating the system prompt to handle this question better.
    </div>` : ''}

    <div style="border-top:1px solid #e2eef5;padding-top:12px;margin-top:4px">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px">Full Conversation So Far (${msgCount} messages)</div>
      ${messages.map((m, i) => `
        <div style="margin-bottom:8px">
          <div style="font-size:10px;font-weight:700;color:${m.role === 'user' ? '#1a5f7a' : '#64748b'};text-transform:uppercase;margin-bottom:2px">
            ${m.role === 'user' ? '👤 Customer' : '🧹 Kay'}
          </div>
          <div style="font-size:12px;color:#334155;line-height:1.5;padding-left:8px;border-left:2px solid ${m.role === 'user' ? '#1a5f7a' : '#e2eef5'}">
            ${typeof m.content === 'string' ? m.content.replace(/\n/g, '<br>') : ''}
          </div>
        </div>
      `).join('')}
    </div>

  </div>
  <div style="background:#f1f5f9;padding:10px 24px;font-size:11px;color:#94a3b8;text-align:center">
    Kashian Bros Kay Audit Trail — kashianbros.com
  </div>
</div>
</body>
</html>`;

    // --- Send audit email via Resend ---
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Kay Audit <bot@kashianbrosautomation.com>',
        to: ['dstein@kashianbros.com'],
        subject: `${isError ? '⚠️ FLAGGED' : '📋 Kay Log'} — ${customerMsg.substring(0, 60)}`,
        html: htmlEmail
      })
    }).catch(e => console.error('Audit email error:', e));

    // --- Return AI response to chatbot ---
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
