exports.handler = async function(event) {

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method not allowed'
    };
  }

  try {

    const body = JSON.parse(event.body || '{}');

    // Conversation history
    const messages = body.messages || [];

    // Optional system prompt
    const systemPrompt = body.system || `
You are Kay, the AI assistant for Kashian Bros.

You help customers with:
- Kitchen remodeling
- Bathroom remodeling
- Tile and backsplash
- Cabinets and countertops
- Flooring
- Hardware and fixtures
- Design consultations
- Scheduling showroom visits

Be warm, professional, concise, and helpful.

If you do not know an answer, politely recommend contacting Kashian Bros directly.
`;

    // Validate message structure
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Messages array is required'
        })
      };
    }

    // --- Call Anthropic API ---
    const response = await fetch(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: body.model || 'claude-3-5-sonnet-20241022',
          max_tokens: body.max_tokens || 500,
          system: systemPrompt,
          messages
        })
      }
    );

    // Anthropic response
    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      console.error('Anthropic API Error:', data);

      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: data.error || 'Anthropic API error'
        })
      };
    }

    // Claude reply text
    const reply =
      data.content &&
      data.content[0] &&
      data.content[0].text
        ? data.content[0].text
        : '';

    // --- Detect fallback/error responses ---
    const errorPhrases = [
      'i had trouble with that',
      'please call',
      'i am having trouble connecting',
      'i\'m having trouble',
      'i don\'t have that information',
      'i\'m not sure about that',
      'i cannot help with that',
      'something went wrong'
    ];

    const isError = errorPhrases.some(p =>
      reply.toLowerCase().includes(p)
    );

    // --- Get latest customer message ---
    const lastUser = [...messages]
      .reverse()
      .find(m => m.role === 'user');

    const customerMsg = lastUser
      ? lastUser.content
      : '(unknown)';

    // --- Email UI Styling ---
    const flagStyle = isError
      ? 'background:#fee2e2;border-left:4px solid #dc2626;padding:12px 14px;border-radius:6px;'
      : 'background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 14px;border-radius:6px;';

    const flagLabel = isError
      ? '<span style="color:#dc2626;font-weight:700;font-size:12px;">⚠️ FLAGGED — Needs Review</span>'
      : '<span style="color:#16a34a;font-weight:700;font-size:12px;">✅ Normal Response</span>';

    const timestamp = new Date().toLocaleString(
      'en-US',
      { timeZone: 'America/Chicago' }
    );

    const msgCount = messages.length;

    // --- Build audit email ---
    const htmlEmail = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2eef5">

  <div style="background:${isError ? '#dc2626' : '#1a5f7a'};padding:14px 24px">
    <h2 style="color:#fff;margin:0;font-size:17px">
      ${isError ? '⚠️ Kay Audit — Flagged Response' : '📋 Kay Audit — Conversation Log'}
    </h2>

    <p style="color:${isError ? '#fecaca' : '#a8d8ea'};margin:4px 0 0;font-size:12px">
      ${timestamp} · Message ${msgCount} in session
    </p>
  </div>

  <div style="padding:20px 24px">

    <div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">
        Customer Asked
      </div>

      <div style="background:#f8fafc;border-radius:6px;padding:10px 14px;font-size:13px;color:#1e293b;line-height:1.6">
        ${customerMsg}
      </div>
    </div>

    <div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:5px">
        Kay Responded
      </div>

      <div style="${flagStyle}">
        ${flagLabel}<br><br>

        <span style="font-size:13px;color:#1e293b;line-height:1.6">
          ${reply.replace(/\n/g, '<br>')}
        </span>
      </div>
    </div>

    ${isError ? `
      <div style="background:#fef9c3;border:1px solid #fcd34d;border-radius:6px;padding:10px 14px;font-size:12.5px;color:#92400e;margin-bottom:14px">
        <strong>Action needed:</strong>
        Kay gave a fallback or uncertain response.
      </div>
    ` : ''}

  </div>

  <div style="background:#f1f5f9;padding:10px 24px;font-size:11px;color:#94a3b8;text-align:center">
    Kashian Bros Kay Audit Trail — kashianbros.com
  </div>

</div>
</body>
</html>`;

    // --- Send audit email ---
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
    }).catch(e => {
      console.error('Audit email error:', e);
    });

    // --- Return AI response ---
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch(e) {

    console.error('Server Error:', e);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: e.message || 'Server error'
      })
    };
  }
};
