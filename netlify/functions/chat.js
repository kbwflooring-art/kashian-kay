exports.handler = async (event) => {
  try {

    // 1. Safely parse request
    let body = {};

    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (err) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Invalid JSON input",
        }),
      };
    }

    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || "Hello";

    // 2. MOCK RESPONSE (replace later with Claude/OpenAI)
    const reply = `Thanks for your message: "${lastMessage}" — how can I help with your flooring or remodeling project?`;

    // 3. ALWAYS return JSON (critical fix)
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: [
          {
            text: reply,
          },
        ],
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Server error",
        details: err.message,
      }),
    };
  }
};
