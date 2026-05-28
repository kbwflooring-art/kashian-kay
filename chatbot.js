(function () {

  if (document.getElementById("kay-widget")) return;

  // =========================
  // STATE
  // =========================
  let history = [];

  // =========================
  // FLOAT BUTTON
  // =========================
  const btn = document.createElement("button");
  btn.innerHTML = "💬";
  btn.style.cssText = `
    position:fixed;bottom:22px;right:22px;
    width:58px;height:58px;border-radius:50%;
    border:none;background:#5bcdc7;color:#111;
    font-size:22px;cursor:pointer;z-index:99999;
    box-shadow:0 8px 22px rgba(0,0,0,0.2);
  `;

  // =========================
  // WIDGET
  // =========================
  const box = document.createElement("div");
  box.id = "kay-widget";

  box.style.cssText = `
    position:fixed;bottom:90px;right:22px;
    width:400px;height:640px;
    background:#eef2f7;border-radius:14px;
    box-shadow:0 15px 40px rgba(0,0,0,0.25);
    display:none;flex-direction:column;
    overflow:hidden;font-family:Raleway,Arial,sans-serif;
    z-index:99999;
  `;

  // mobile fullscreen
  function isMobile() {
    return window.innerWidth < 520;
  }

  function applyMobile() {
    if (!isMobile()) return;
    box.style.width = "100%";
    box.style.height = "100%";
    box.style.bottom = "0";
    box.style.right = "0";
    box.style.borderRadius = "0";
  }

  window.addEventListener("resize", applyMobile);

  // =========================
  // HEADER
  // =========================
  const header = document.createElement("div");
  header.style.cssText = `
    background:#5bcdc7;padding:12px 14px;
    display:flex;justify-content:space-between;
    align-items:center;
  `;

  header.innerHTML = `
    <div>
      <div style="font-weight:700;font-size:14px;color:#111">Kay - Kashian Bros</div>
      <div style="font-size:11px;color:#111;opacity:.8">AI Assistant • Pro Mode</div>
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
  // QUICK ACTIONS
  // =========================
  const quick = document.createElement("div");
  quick.style.cssText = `
    display:flex;flex-wrap:wrap;gap:6px;
    padding:10px;background:#fff;
    border-top:1px solid #dbe7ea;
  `;

  function q(text, msg) {
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

  quick.appendChild(q("Schedule", "I want to schedule a service"));
  quick.appendChild(q("Pricing", "Tell me about pricing"));
  quick.appendChild(q("Services", "What services do you offer?"));

  // =========================
  // INPUT
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
    width:42px;height:42px;border:none;
    border-radius:10px;background:#5bcdc7;
    cursor:pointer;
  `;

  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);

  // =========================
  // BUILD
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
    applyMobile();
  };

  // =========================
  // MESSAGE UI
  // =========================
  function addBubble(text, user = false) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = user ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");
    bubble.style.cssText = `
      max-width:82%;
      padding:10px 12px;
      font-size:13px;
      line-height:1.4;
      border-radius:${user ? "14px 14px 3px 14px" : "14px 14px 14px 3px"};
      background:${user ? "#5bcdc7" : "#fff"};
      border:${user ? "none" : "1px solid #dbe7ea"};
      color:#111;
      white-space:pre-wrap;
    `;

    row.appendChild(bubble);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;

    return bubble;
  }

  // =========================
  // TYPING (PRO MODE STREAM SIMULATION)
  // =========================
  function typeText(el, text) {
    let i = 0;
    const speed = 8; // faster than real typing but feels live

    function step() {
      el.textContent += text[i];
      i++;
      msgs.scrollTop = msgs.scrollHeight;
      if (i < text.length) requestAnimationFrame(step);
    }

    step();
  }

  function showLoading() {
    const row = document.createElement("div");
    row.style.display = "flex";

    const dot = document.createElement("div");
    dot.textContent = "Kay is thinking...";
    dot.style.cssText = `
      font-size:12px;color:#666;
      padding:8px 10px;
    `;

    row.appendChild(dot);
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;

    return row;
  }

  // =========================
  // SEND
  // =========================
  async function send(text) {
    if (!text?.trim()) return;

    input.value = "";
    addBubble(text, true);

    history.push({ role: "user", content: text });

    const loading = showLoading();

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 800,
          messages: history
        })
      });

      const data = await res.json();
      const reply = data?.content?.[0]?.text || "Sorry — I had trouble responding.";

      loading.remove();

      const bubble = addBubble("", false);
      typeText(bubble, reply);

      history.push({ role: "assistant", content: reply });

      // OPTIONAL: booking form trigger support
      if (reply.includes("[SHOW_BOOKING_FORM")) {
        console.log("Booking form trigger detected");
      }

    } catch (e) {
      loading.remove();
      addBubble("Connection error. Please try again.", false);
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
  // WELCOME
  // =========================
  addBubble("Hi! I’m Kay from Kashian Bros. How can I help you today?", false);

})();
