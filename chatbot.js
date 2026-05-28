(function () {

  // Prevent duplicate load
  if (document.getElementById("kashian-chat-widget")) return;

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
  // STYLES
  // =========================

  const style = document.createElement("style");
  style.innerHTML = `

  * {
    box-sizing: border-box;
  }

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
    transition: all .2s ease;
  }

  #kashian-chat-button:hover {
    transform: scale(1.05);
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
    font-family: Raleway, Arial, sans-serif;
    color: #000;
  }

  .k-header {
    background: #5bcdc7;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #9de8e4;
  }

  .k-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #7ddbd6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  .k-title {
    font-size: 15px;
    font-weight: 700;
    color: #000;
  }

  .k-sub {
    font-size: 11px;
    color: #111;
    margin-top: 2px;
  }

  .k-status {
    margin-left: auto;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #22c55e;
  }

  .k-messages {
    flex: 1;
    overflow-y: auto;
    background: #fff;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .k-row {
    display: flex;
    gap: 10px;
    max-width: 90%;
  }

  .k-row.user {
    margin-left: auto;
    flex-direction: row-reverse;
  }

  .k-row.bot {
    margin-right: auto;
  }

  .k-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    font-size: 14px;
  }

  .k-icon.bot {
    background: #dff8f6;
  }

  .k-icon.user {
    background: #e6eeff;
  }

  .k-bubble {
    padding: 12px 15px;
    font-size: 14px;
    line-height: 1.6;
    color: #000 !important;
    word-wrap: break-word;
  }

  .k-bubble * {
    color: #000 !important;
  }

  .k-bubble.bot {
    background: #f0fafa;
    border-radius: 4px 16px 16px 16px;
  }

  .k-bubble.user {
    background: #5bcdc7;
    border-radius: 16px 4px 16px 16px;
  }

  .k-quick {
    padding: 10px;
    border-top: 1px solid #eef2f7;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: #fff;
  }

  .k-qbtn {
    border: 1px solid #9de8e4;
    background: #f0fafa;
    color: #000;
    border-radius: 18px;
    padding: 7px 12px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
  }

  .k-input-wrap {
    border-top: 1px solid #dbe7ef;
    padding: 12px;
    display: flex;
    gap: 10px;
    background: #fff;
  }

  .k-input {
    flex: 1;
    resize: none;
    border: 1.5px solid #9de8e4;
    border-radius: 12px;
    padding: 10px 12px;
    outline: none;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    color: #000;
    max-height: 100px;
  }

  .k-send {
    width: 42px;
    height: 42px;
    border: none;
    background: #5bcdc7;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
    font-size: 18px;
    color: #000;
  }

  .k-send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .k-typing {
    display: flex;
    gap: 4px;
    padding: 14px;
    background: #f0fafa;
    border-radius: 4px 16px 16px 16px;
  }

  .k-typing div {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #5bcdc7;
    animation: bounce 1.2s infinite;
  }

  .k-typing div:nth-child(2) {
    animation-delay: .2s;
  }

  .k-typing div:nth-child(3) {
    animation-delay: .4s;
  }

  @keyframes bounce {
    0%,60%,100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-5px);
    }
  }

  @media(max-width:600px){
    #kashian-chat-widget{
      width:calc(100vw - 24px);
      height:calc(100vh - 120px);
      right:12px;
      bottom:88px;
    }
  }

  `;
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
        <div class="k-sub">
          Flooring, Remodeling & Cleaning
        </div>
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
      <textarea
        id="k-input"
        class="k-input"
        rows="1"
        placeholder="Ask Kay anything..."
      ></textarea>

      <button id="k-send" class="k-send">➤</button>
    </div>
  `;

  document.body.appendChild(button);
  document.body.appendChild(widget);

  // =========================
  // ELEMENTS
  // =========================

  const msgs = document.getElementById("k-messages");
  const input = document.getElementById("k-input");
  const sendBtn = document.getElementById("k-send");

  // =========================
  // TOGGLE
  // =========================

  button.onclick = () => {
    widget.style.display =
      widget.style.display === "flex"
        ? "none"
        : "flex";
  };

  // =========================
  // ADD MESSAGE
  // =========================

  function addMessage(role, text) {

    const row = document.createElement("div");
    row.className = `k-row ${role}`;

    row.innerHTML = `
      <div class="k-icon ${role}">
        ${role === "bot" ? "🧹" : "👤"}
      </div>

      <div class="k-bubble ${role}">
        ${text}
      </div>
    `;

    msgs.appendChild(row);

    msgs.scrollTop = msgs.scrollHeight;
  }

  // =========================
  // TYPING
  // =========================

  function addTyping() {

    const row = document.createElement("div");
    row.className = "k-row bot";
    row.id = "k-typing-row";

    row.innerHTML = `
      <div class="k-icon bot">🧹</div>

      <div class="k-typing">
        <div></div>
        <div></div>
        <div></div>
      </div>
    `;

    msgs.appendChild(row);

    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("k-typing-row");
    if (el) el.remove();
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

      const res = await fetch(API_URL, {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Server error"
        );
      }

      const reply =
        data?.content?.[0]?.text ||
        "I had trouble with that.";

      removeTyping();

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

  sendBtn.onclick = () => {
    sendMessage(input.value);
  };

  input.addEventListener("keydown", function (e) {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  // =========================
  // QUICK BUTTONS
  // =========================

  document.querySelectorAll(".k-qbtn")
    .forEach(btn => {

      btn.onclick = () => {
        sendMessage(btn.innerText);
      };

    });

  // =========================
  // WELCOME
  // =========================

  addMessage(
    "bot",
    "Hi! I’m Kay from Kashian Bros. How can I help you today?"
  );

})();
