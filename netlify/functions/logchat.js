// Sends Kay chatbot conversation logs to dstein@kashianbros.com
// Called via navigator.sendBeacon when a customer closes the chat or leaves the page
const fetch = require("node-fetch");

exports.handler = async (event) => {
  console.log("=== logchat function invoked ===");
  console.log("Method:", event.httpMethod);
  console.log("Body length:", event.body ? event.body.length : 0);

  // CORS preflight
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
    console.log("EARLY EXIT: no body");
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Missing request body" })
    };
  }

  // Check API key
  const hasApiKey = !!process.env.RESEND_API_KEY;
  console.log("RESEND_API_KEY present:", hasApiKey);
  if (hasApiKey) {
    console.log("API key length:", process.env.RESEND_API_KEY.length);
  }

  try {
    const parsed = JSON.parse(event.body);
    const { transcript, startedAt, endedAt, pageUrl, userAgent, booking } = parsed;
    console.log("Transcript length:", transcript ? transcript.length : 0);
    if (transcript && transcript.length > 0) {
      console.log("First message:", JSON.stringify(transcript[0]).substring(0, 200));
    }

    // Skip empty conversations (customer opened chat but never typed anything)
    if (!Array.isArray(transcript) || transcript.length === 0) {
      console.log("EARLY EXIT: empty transcript");
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ skipped: "empty conversation" })
      };
    }
    // Also skip if there are no USER messages (only Kay's welcome message)
    const hasUserMessages = transcript.some(m => m.role === "user");
    console.log("Has user messages:", hasUserMessages);
    if (!hasUserMessages) {
      console.log("EARLY EXIT: no user messages");
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ skipped: "no user messages" })
      };
    }

    // Format the transcript as readable HTML
    const transcriptHtml = transcript.map(msg => {
      const isUser = msg.role === "user";
      const label = isUser ? "Customer" : "Kay";
      const bg = isUser ? "#e0f7f5" : "#f8fafc";
      const border = isUser ? "#5bcdc7" : "#cbd5e1";
      const safe = String(msg.content || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      return `<div style="margin:8px 0;padding:10px 14px;background:${bg};border-left:3px solid ${border};border-radius:4px;">
        <div style="font-weight:700;font-size:12px;color:#475569;margin-bottom:4px;">${label}</div>
        <div style="font-size:14px;color:#111;line-height:1.5;">${safe}</div>
      </div>`;
    }).join("");

    const bookingHtml = booking ? `
      <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:14px;margin:16px 0;">
        <h3 style="color:#15803d;margin:0 0 8px 0;font-size:15px;">Booking Submitted During This Conversation</h3>
        <div style="font-size:13px;color:#166534;white-space:pre-wrap;">${String(booking).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      </div>
    ` : "";

    const durationMs = endedAt && startedAt ? (new Date(endedAt) - new Date(startedAt)) : 0;
    const durationStr = durationMs > 0 ? `${Math.round(durationMs / 1000 / 60 * 10) / 10} minutes` : "unknown";
    const userMessageCount = transcript.filter(m => m.role === "user").length;

    const emailHtml = `<!DOCTYPE html>
<html><body style="font-family:Raleway,Arial,sans-serif;background:#f4f4f4;padding:20px;margin:0;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    <div style="background:#88EAE4;padding:18px 22px;">
      <h1 style="margin:0;color:#fff;font-size:19px;text-shadow:0 1px 2px rgba(0,0,0,0.08);">Kay Chatbot - Conversation Log</h1>
    </div>
    <div style="padding:20px 22px;">
      <table style="width:100%;font-size:13px;color:#333;border-collapse:collapse;margin-bottom:16px;">
        <tr><td style="padding:3px 0;color:#64748b;width:120px;">Started:</td><td>${startedAt || "unknown"}</td></tr>
        <tr><td style="padding:3px 0;color:#64748b;">Ended:</td><td>${endedAt || "unknown"}</td></tr>
        <tr><td style="padding:3px 0;color:#64748b;">Duration:</td><td>${durationStr}</td></tr>
        <tr><td style="padding:3px 0;color:#64748b;">Messages from customer:</td><td>${userMessageCount}</td></tr>
        <tr><td style="padding:3px 0;color:#64748b;">Page:</td><td style="word-break:break-all;">${(pageUrl || "unknown").replace(/</g, "&lt;")}</td></tr>
        <tr><td style="padding:3px 0;color:#64748b;">Browser:</td><td style="font-size:11px;color:#64748b;">${(userAgent || "unknown").replace(/</g, "&lt;")}</td></tr>
      </table>
      ${bookingHtml}
      <h2 style="font-size:15px;color:#111;margin:16px 0 8px 0;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">Full Transcript</h2>
      ${transcriptHtml}
    </div>
    <div style="background:#f8fafc;padding:12px 22px;font-size:11px;color:#64748b;text-align:center;">
      Automated log from Kay - Kashian Bros chatbot
    </div>
  </div>
</body></html>`;

    console.log("About to call Resend API...");

    // Send via Resend
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Kay Chatbot <bot@kashianbrosautomation.com>",
        to: ["dstein@kashianbros.com"],
        subject: `Kay chat log - ${userMessageCount} message${userMessageCount === 1 ? "" : "s"}${booking ? " - BOOKING SUBMITTED" : ""}`,
        html: emailHtml
      })
    });

    const resendStatus = resendResp.status;
    const resendData = await resendResp.json();
    console.log("Resend response status:", resendStatus);
    console.log("Resend response body:", JSON.stringify(resendData));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ ok: true, resendStatus: resendStatus, resend: resendData })
    };
  } catch (err) {
    console.log("ERROR:", err.message);
    console.log("Stack:", err.stack);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
