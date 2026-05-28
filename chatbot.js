(function () {

  // Prevent duplicate load
  if (document.getElementById("kashian-chat-widget")) return;

  console.log("Kashian chatbot loaded");

  // =========================
  // CONFIG
  // =========================

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
  // STYLES (RESTORED - REQUIRED OR UI "DISAPPEARS")
  // =========================

  const style = document.createElement("style");
  style.innerHTML = `
  * { box-sizing: border-box; }

  #kashian-chat-button {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: none;
    background: #5bcdc7;
    color: #000;
    font-size: 26px;
    cursor: pointer;
    z-index: 999999;
    box-shadow: 0 8px 30px rgba(0,0,0,0.18);
  }

  #kashian-chat-widget {
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 380px;
    height: 680px;
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    display: none;
    flex-direction: column;
    z-index: 999999;
    box-shadow: 0 20px 60px rgba(0,0,0,0.22);
    border: 1px solid #dbe7ef;
    font-family: Arial, sans-serif;
  }

  .k-header { padding: 16px; background: #5bcdc7; display:flex; gap:10px; align-items:center; }

  .k-messages { flex:1; padding:18px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; }

  .k-row.user { margin-left:auto; }

  .k-bubble {
    padding: 10px 14px;
    border-radius: 12px;
    max-width: 80%;
    font-size: 14px;
  }

  .k-bubble.user { background:#5bcdc7; }
  .k-bubble.bot { background:#f0fafa; }

  .k-input-wrap {
    display:flex;
    gap:10px;
    padding:12px;
    border-top:1px solid #ddd;
  }

  .k-input {
    flex:1;
    padding:10px;
    border:1px solid #ccc;
    border-radius:10px;
  }

  .k-send {
    width:42px;
    border:none;
    background:#5bcdc7;
    border-radius:10px;
    cursor:pointer;
  }

  .k-typing { opacity:0.7; font-size:13px; }
  `;
  document.head.appendChild(style);

  // =========================
  // BUTTON + WIDGET
  // =========================

  const button = document.createElement("button");
  button.id = "kashian-chat-button";
  button.innerHTML = "💬";

  const widget = document.createElement("div");
  widget.id = "kashian-chat-widget";

  widget.innerHTML = `
    <div class="k-header">
      <div>🧹 Kay - Kashian Bros</div>
    </div>

    <div class="k-messages" id="k-messages"></div>

    <div class="k-input-wrap">
      <input id="k-input" class="k-input" placeholder="Ask Kay anything..." />
      <button id="k-send" class="k-send">➤</button>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(widget);

  const msgs = document.getElementById("k-messages");
  const input = document.getElementById("k-input");
  const sendBtn = document.getElementById("k-send");

  // =========================
  // UI HELPERS
  // =========================

  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `k-row ${role}`;

    row.innerHTML = `
      <div class="k-bubble ${role}">${text}</div>
    `;

    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping() {
    const div = document.createElement("div");
    div.id = "typing";
    div.className = "k-typing";
    div.innerText = "Kay is typing...";
    msgs.appendChild(div);
  }

  function removeTyping() {
    document.getElementById("typing")?.remove();
  }

  // =========================
  // TOGGLE
  // =========================

  button.onclick = () => {
    widget.style.display = widget.style.display === "flex" ? "none" : "flex";
  };

  // =========================
  // SAFE FETCH (FIXES YOUR ERROR)
  // =========================

  async function safeFetchJSON(url, options) {
    try {
      const res = await fetch(url, options);
      const text = await res.text();

      // Detect HTML response (THIS WAS YOUR ORIGINAL CRASH)
      if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
        console.error("HTML returned instead of JSON:", text);
        throw new Error("Backend returned HTML instead of JSON");
      }

      return {
        ok: res.ok,
        data: JSON.parse(text)
      };

    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
  }

  // =========================
  // SEND MESSAGE
  // =========================

  async function sendMessage(text) {
    if (!text.trim()) return;

    addMessage("user", text);
    history.push({ role: "user", content: text });

    input.value = "";
    sendBtn.disabled = true;

    addTyping();

    try {

      const result = await safeFetchJSON(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      removeTyping();

      if (!result.ok) {
        throw new Error("Server error");
      }

      const reply =
        result.data?.content?.[0]?.text ||
        "Sorry, I couldn't respond.";

      addMessage("bot", reply);

      history.push({ role: "assistant", content: reply });

    } catch (err) {

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
    if (e.key === "Enter") sendMessage(input.value);
  });

  // =========================
  // INIT MESSAGE
  // =========================

  addMessage("bot", "Hi! I’m Kay from Kashian Bros. How can I help you today?");

})();
