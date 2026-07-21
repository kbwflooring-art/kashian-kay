const fetch = require("node-fetch");

// In-memory per-IP rate limit (10 requests per hour).
// Persists as long as the Netlify function container stays warm.
// Cold starts / new containers = fresh counters, which is fine for casual bot spam.
const ipHistory = new Map();
const RATE_LIMIT = 10; // max requests per IP per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIP(event) {
  // Netlify passes client IP in several headers. Try each in order of reliability.
  const h = event.headers || {};
  return h["x-nf-client-connection-ip"]
      || (h["x-forwarded-for"] || "").split(",")[0].trim()
      || h["client-ip"]
      || "unknown";
}

function isRateLimited(ip) {
  if (!ip || ip === "unknown") return false;
  const now = Date.now();
  let record = ipHistory.get(ip);
  if (!record) {
    record = { count: 1, firstSeen: now };
    ipHistory.set(ip, record);
    return false;
  }
  // Reset window if expired
  if (now - record.firstSeen > RATE_WINDOW_MS) {
    record.count = 1;
    record.firstSeen = now;
    return false;
  }
  record.count++;
  // Occasional cleanup: prune expired records so the map doesn't grow forever
  if (ipHistory.size > 500) {
    for (const [key, val] of ipHistory) {
      if (now - val.firstSeen > RATE_WINDOW_MS) ipHistory.delete(key);
    }
  }
  return record.count > RATE_LIMIT;
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }
  if (!event.body) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing request body" })
    };
  }

  // ----- IP RATE LIMIT -----
  const ip = getClientIP(event);
  if (isRateLimited(ip)) {
    console.log(`Rate limit hit for IP: ${ip}`);
    // Return a valid response so the chatbot displays a canned message.
    // NOT an error, so the chatbot's normal reply flow shows it cleanly.
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        content: [{
          type: "text",
          text: "You've reached our chat message limit. For more help, please call us at (847) 251-1200 or email info@kashianbros.com."
        }]
      })
    };
  }

  try {
    // Accept BOTH messages (the conversation) and system (the rules/persona) as separate fields
    const { messages, system } = JSON.parse(event.body);
    // Build the API request body. Only include "system" if it was sent.
    const apiBody = {
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: messages
    };
    if (system && typeof system === "string" && system.length > 0) {
      apiBody.system = system;
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(apiBody)
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
