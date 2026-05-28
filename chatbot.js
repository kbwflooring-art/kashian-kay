(function () {

  if (document.getElementById("kashian-chat-widget")) return;

  const API_URL = "/.netlify/functions/chat";

  const SYSTEM_PROMPT = `
You are Kay, the AI assistant for Kashian Bros.

You help customers with:
- Flooring
- Carpet cleaning
- Rug cleaning
- Upholstery cleaning
- Kitchen remodeling
- Bathroom remodeling
- Cabinets
- Tile
- Countertops

Be warm, concise, helpful, and professional.

If unsure:
Please recommend calling (847) 251-1200.
`;

  let history = [];

  // =========================
  // STYLES (UNCHANGED)
  // =========================

  const style = document.createElement("style");
  style.innerHTML = `/* your CSS stays exactly as-is */`;
  document.head.appendChild(style);

  // =========================
  // BUTTON
  // =========================

  const button = document.createElement("button");
  button.id = "kashian-chat-button";
  button.innerHTML = "💬";

  // =========================
  // WIDGET
  // =========================

  const widget = document.createElement("div");
  widget.id = "kashian-chat-widget";

  widget.innerHTML = `
    <div class="k-header">
      <div class="k-avatar">🧹</div>

      <div>
        <div class="k-title">Kay - Kashian Bros</div>
        <div class="k-sub">Flooring, Remodeling & Cleaning</div>
      </div>

      <div class="k-status"></div>
    </div>

    <div class="k-messages" id="k-messages"></div>

    <div class="k-quick">
      <button class="k-qbtn">Schedule Service</button>
      <button class="k-qbtn">Cleaning Pricing</button>
      <button class="k-qbtn">Remodeling Help</button>
    </div>

    <div class="k-input-wrap">
      <textarea id="k-input" class="k-input" rows="1" placeholder="Ask Kay anything..."></textarea>
      <button id="k-send" class="k-send">➤</button>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(widget);

  const msgs = document.getElementById("k-messages");
  const input = document.getElementById("k-input");
  const sendBtn = document.getElementById("k-send");

  // =========================
  // FIX #1: ADD MESSAGE FUNCTION (WAS MISSING)
  // =========================

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `k-row ${role}`;

    row.innerHTML = `
      <div class="k-icon ${role}">
        ${role === "bot" ? "🧹" : "👤"}
      </div>
      <div class="k-bubble ${role}">${text}</div>
    `;

    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "k-row bot";
    row.id = "k-typing-row";

    row.innerHTML = `
      <div class="k-icon bot">🧹</div>
      <div class="k-typing">
        <div></div><div></div><div></div>
      </div>
    `;

    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    document.getElementById("k-typing-row")?.remove();
  }

  // =========================
  // TOGGLE
  // =========================

  button.onclick = () => {
    widget.style.display =
      widget.style.display === "flex" ? "none" : "flex";
  };

  // =========================
  // FIX #2: SAFE FETCH (NO JSON CRASH)
  // =========================

  async function safeFetch(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();

    let data = null;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("NON-JSON RESPONSE:", text);
      throw new Error("Backend did not return JSON");
    }

    return { res, data };
  }

  // =========================
  // SEND
  // =========================

  async function sendMessage(text) {

    if (!text.trim()) return;

    addMessage("user", text);

    history.push({
      role: "user",
      content: text
    });

    input.value = "";
    sendBtn.disabled = true;

    addTyping();

    try {

      const { res, data } = await safeFetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      removeTyping();

      if (!res.ok) {
        throw new Error(data?.error || "Server error");
      }

      const reply =
        data?.content?.[0]?.text ||
        "I had trouble responding.";

      addMessage("bot", reply);

      history.push({
        role: "assistant",
        content: reply
      });

    } catch (err) {

      console.error(err);

      removeTyping();

      addMessage(
        "bot",
        "Connection error. Please call (847) 251-1200."
      );

    } finally {
      sendBtn.disabled = false;
    }
  }

  // =========================
  // EVENTS
  // =========================

  sendBtn.onclick = () => sendMessage(input.value);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  document.querySelectorAll(".k-qbtn").forEach(btn => {
    btn.onclick = () => sendMessage(btn.innerText);
  });

  // =========================
  // WELCOME
  // =========================

  addMessage("bot", "Hi! I’m Kay from Kashian Bros. How can I help you today?");

})();
