exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Messages required" }),
      };
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-3-5-sonnet-20241022",
        max_tokens: body.max_tokens || 800,
        system: body.system || "You are a helpful assistant.",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data }),
      };
    }

    const reply = data?.content?.[0]?.text || "";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        content: [{ text: reply }],
      }),
    };
  } catch (err) {
    console.error("Function crash:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Server error",
      }),
    };
  }
};
