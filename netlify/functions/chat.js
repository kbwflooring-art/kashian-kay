exports.handler = async (event) => {
  try {

    // Handle missing body safely
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing request body"
        })
      };
    }

    const body = JSON.parse(event.body);

    const userMessage = body?.messages?.slice(-1)?.[0]?.content || "No message";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        content: [
          {
            text: `Hello! You said: "${userMessage}"`
          }
        ]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Server error",
        details: err.message
      })
    };
  }
};
