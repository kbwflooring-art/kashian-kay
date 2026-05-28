exports.handler = async function (event) {

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {

    const body = JSON.parse(event.body || '{}');

    const messages = body.messages;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Messages array is required'
        })
      };
    }

    // System prompt
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
If unsure, suggest contacting Kashian Bros directly.
`;

    // --- Call Anthropic ---
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

    // ---- SAFE error handling (IMPORTANT FIX) ----
    let data;
    const rawText = await response.text();

    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse Anthropic response:", rawText);

      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Invalid response from Anthropic API',
          raw: rawText
        })
      };
    }

    // Handle API errors properly
    if (!response.ok) {
      console.error("Anthropic API Error:", data);

      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: data.error?.message || data.error || 'Anthropic API error'
        })
      };
    }

    // Extract reply safely
    const reply =
      data.content?.[0]?.text || '';

    // Get last user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');

    const customerMsg = lastUser?.content || '(unknown)';

    // --- Detect fallback responses ---
    const errorPhrases = [
      'i had trouble with that',
      'please call',
      'i am having trouble',
      'i\'m having trouble',
      'i don\'t have that information',
      'i cannot help with that',
      'something went wrong'
    ];

    const isError = errorPhrases.some(p =>
      reply.toLowerCase().includes(p)
    );

    // --- AUDIT EMAIL (kept simple + safe) ---
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/Chicago'
    });

    const htmlEmail = `
      <div style="font-family:Arial;padding:20px">
        <h2>Kay Chat Log</h2>
        <p><b>Time:</b> ${timestamp}</p>
        <p><b>User:</b> ${customerMsg}</p>
        <p><b>Reply:</b> ${reply}</p>
        <p><b>Status:</b> ${isError ? 'FLAGGED' : 'OK'}</p>
      </div>
    `;

    // Send audit email (non-blocking)
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Kay Bot <bot@kashianbrosautomation.com>',
        to: ['dstein@kashianbros.com'],
        subject: `Kay Chat — ${customerMsg.slice(0, 50)}`,
        html: htmlEmail
      })
    }).catch(err => console.error("Email error:", err));

    // --- Return success response ---
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (e) {

    console.error("Server Error:", e);

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
