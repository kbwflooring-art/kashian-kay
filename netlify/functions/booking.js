exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const b = JSON.parse(event.body);
    // Booking received and logged - email integration pending domain setup
    console.log('BOOKING RECEIVED:', JSON.stringify(b));
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
