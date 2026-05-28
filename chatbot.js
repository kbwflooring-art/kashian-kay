(function () {

  if (document.getElementById("kay-widget")) return;

  // =========================
  // FLOAT BUTTON
  // =========================
  const btn = document.createElement("button");
  btn.innerHTML = "💬";
  btn.style.cssText = `
    position:fixed;bottom:22px;right:22px;
    width:56px;height:56px;border-radius:50%;
    border:none;background:#5bcdc7;color:#111;
    font-size:22px;cursor:pointer;z-index:99999;
    box-shadow:0 6px 18px rgba(0,0,0,0.18);
  `;

  // =========================
  // WIDGET WRAPPER
  // =========================
  const box = document.createElement("div");
  box.id = "kay-widget";
  box.style.cssText = `
    position:fixed;bottom:90px;right:22px;
    width:390px;height:620px;
    background:#eef2f7;border-radius:14px;
    box-shadow:0 12px 35px rgba(0,0,0,0.25);
    display:none;flex-direction:column;
    overflow:hidden;font-family:Raleway,Arial,sans-serif;
    z-index:99999;
  `;

  // =========================
  // HEADER (matches full app)
  // =========================
  const header = document.createElement("div");
  header.style.cssText = `
    background:#5bcdc7;padding:12px 14px;
    display:flex;align-items:center;justify-content:space-between;
  `;

  header.innerHTML = `
    <div>
      <div style="font-weight:700;font-size:14px;color:#111">Kay - Kashian Bros</div>
      <div style="font-size:11px;color:#111;opacity:.8">AI Assistant</div>
    </div>
    <div style="width:10px;height:10px;background:#22c55e;border-radius:50%"></div>
  `;

  // =========================
  // CHAT AREA
  // =========================
  const msgs = document.createElement("div");
  msgs.style.cssText = `
    flex:1;overflow-y:auto;
    padding:14px;display:flex;
    flex-direction:column;gap:10px;
  `;

  // =========================
  // QUICK ACTIONS (like your app)
  // =========================
  const quick = document.createElement("div");
  quick.style.cssText = `
    display:flex;flex-wrap:wrap;gap:6px;
    padding:10px;background:#fff;
    border-top:1px solid #dbe7ea;
  `;

  function qBtn(text, msg) {
    const b = document.createElement("button");
    b.textContent = text;
    b.style.cssText = `
      font-size:11px;padding:6px 10px;
      border-radius:999px;border:1px solid #5bcdc7;
      background:#f0fafa;cursor:pointer;
    `;
    b.onclick = () => send(msg);
    return b;
  }

  quick.appendChild(qBtn("Schedule", "I want to schedule a service"));
  quick.appendChild(qBtn("Pricing", "Tell me about pricing"));
  quick.appendChild(qBtn("Services", "What services do you offer?"));

  // =========================
  // INPUT BAR
  // =========================
  const inputBar = document.createElement("div");
  inputBar.style.cssText = `
    display:flex;gap:8px;padding:10px;
    background:#fff;border-top:1px solid #dbe7ea;
  `;

  const input = document.createElement("textarea");
  input.rows = 1;
  input.placeholder = "Ask Kay anything...";
  input.style.cssText = `
    flex:1;resize:none;padding:10px;
    border:1px solid #9de8e4;border-radius:10px;
    font-family:inherit;font-size:13px;
    outline:none;
  `;

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "➤";
  sendBtn.style.cssText = `
    width:40px;height:40px;border:none;
    border-radius:10px;background:#5bcdc7;
    cursor:pointer;
  `;

  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);

  // =========================
  // ASSEMBLE
  // =========================
  box.appendChild(header);
  box.appendChild(msgs);
  box.appendChild(quick);
  box.appendChild(inputBar);

  document.body.appendChild(btn);
  document.body.appendChild(box);

  // =========================
  // TOGGLE
  // =========================
  btn.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
  };

  // =========================
  // MESSAGE RENDERING
  // =========================
  function addMsg(text, user = false) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = user ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");
    bubble.textContent = text;

    bubble.style.cssText = `
      max-width:80%;
      padding:10px 12px;
      font-size:13px;
      line-height:1.4;
      border-radius:${user ? "14px 14px 3px 14px" : "14px 14px 14px 3px"};
      background:${user ? "#5bcdc7" : "#fff"};
      border:${user ? "none" : "1px solid #dbe7ea"};
      color:#111;
    `;

    row.appendChild(bubble);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // =========================
  // SEND FUNCTION (matches Netlify chat)
  // =========================
  async function send(text) {
    if (!text || !text.trim()) return;

    input.value = "";
    addMsg(text, true);

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 600,
          messages: [{ role: "user", content: text }]
        })
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text || "Sorry, I had trouble responding.";
      addMsg(reply, false);

    } catch (e) {
      addMsg("Connection error. Please try again.", false);
    }
  }

  sendBtn.onclick = () => send(input.value);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });

  // =========================
  // WELCOME MESSAGE
  // =========================
  addMsg("Hi! I’m Kay from Kashian Bros. How can I help you today?", false);

})();
