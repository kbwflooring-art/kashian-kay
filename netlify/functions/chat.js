exports.handler = async function (event) {
  console.log("Chat function triggered");

  // CORS support
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.messages || !Array.isArray(body.messages)) {
      console.log("Invalid request body:", body);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Messages array required" }),
      };
    }

    console.log("Messages received:", body.messages.length);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-3-5-sonnet-20241022",
        max_tokens: body.max_tokens || 500,
        system:
          body.system ||
          "You are a helpful assistant for Kashian Bros.",
        messages: body.messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API ERROR:", data);

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: data.error?.message || "Anthropic API error",
          raw: data,
        }),
      };
    }

    const reply = data?.content?.[0]?.text || "";

    console.log("Reply generated:", reply.substring(0, 80));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("FUNCTION ERROR:", err);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err.message || "Server error",
      }),
    };
  }
};
