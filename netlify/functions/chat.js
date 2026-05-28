(function () {

  if (document.getElementById("native-chatbot")) return;

  // ===== Floating Button =====
  const button = document.createElement("button");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "22px";
  button.style.right = "22px";
  button.style.width = "56px";
  button.style.height = "56px";
  button.style.borderRadius = "50%";
  button.style.border = "none";
  button.style.background = "#5bcdc7";
  button.style.color = "#111";
  button.style.fontSize = "22px";
  button.style.cursor = "pointer";
  button.style.zIndex = "99999";
  button.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)";

  // ===== Container =====
  const chatWindow = document.createElement("div");
  chatWindow.id = "native-chatbot";
  chatWindow.style.position = "fixed";
  chatWindow.style.bottom = "90px";
  chatWindow.style.right = "22px";
  chatWindow.style.width = "380px";
  chatWindow.style.height = "600px";
  chatWindow.style.background = "#eef2f7";
  chatWindow.style.borderRadius = "14px";
  chatWindow.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
  chatWindow.style.display = "none";
  chatWindow.style.flexDirection = "column";
  chatWindow.style.overflow = "hidden";
  chatWindow.style.zIndex = "99999";
  chatWindow.style.fontFamily = "Raleway, Arial, sans-serif";

  // ===== Header (matches demo banner feel) =====
  const header = document.createElement("div");
  header.style.background = "#5bcdc7";
  header.style.padding = "12px 14px";
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.justifyContent = "space-between";

  header.innerHTML = `
    <div style="display:flex;flex-direction:column">
      <div style="font-weight:700;font-size:14px;color:#111">Kay - Kashian Bros</div>
      <div style="font-size:11px;color:#111;opacity:.8">AI Assistant</div>
    </div>
    <div style="width:10px;height:10px;background:#22c55e;border-radius:50%"></div>
  `;

  // ===== Messages =====
  const messages = document.createElement("div");
  messages.style.flex = "1";
  messages.style.padding = "14px";
  messages.style.overflowY = "auto";
  messages.style.display = "flex";
  messages.style.flexDirection = "column";
  messages.style.gap = "10px";

  // ===== Quick Buttons =====
  const quick = document.createElement("div");
  quick.style.display = "flex";
  quick.style.flexWrap = "wrap";
  quick.style.gap = "6px";
  quick.style.padding = "10px 12px";
  quick.style.borderTop = "1px solid #dbe7ea";
  quick.style.background = "#fff";

  function quickBtn(label, msg) {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.fontSize = "11px";
    b.style.padding = "6px 10px";
    b.style.borderRadius = "999px";
    b.style.border = "1px solid #5bcdc7";
    b.style.background = "#f0fafa";
    b.style.cursor = "pointer";
    b.onclick = () => send(msg);
    return b;
  }

  quick.appendChild(quickBtn("Schedule", "I want to schedule a service"));
  quick.appendChild(quickBtn("Pricing", "Tell me about pricing"));
  quick.appendChild(quickBtn("Services", "What services do you offer?"));

  // ===== Input =====
  const inputBar = document.createElement("div");
  inputBar.style.display = "flex";
  inputBar.style.padding = "10px";
  inputBar.style.background = "#fff";
  inputBar.style.borderTop = "1px solid #dbe7ea";

  const input = document.createElement("textarea");
  input.rows = 1;
  input.placeholder = "Ask Kay anything...";
  input.style.flex = "1";
  input.style.padding = "10px";
  input.style.border = "1px solid #9de8e4";
  input.style.borderRadius = "10px";
  input.style.resize = "none";
  input.style.fontFamily = "inherit";
  input.style.fontSize = "13px";

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "➤";
  sendBtn.style.marginLeft = "8px";
  sendBtn.style.width = "40px";
  sendBtn.style.height = "40px";
  sendBtn.style.border = "none";
  sendBtn.style.borderRadius = "10px";
  sendBtn.style.background = "#5bcdc7";
  sendBtn.style.cursor = "pointer";

  inputBar.appendChild(input);
  inputBar.appendChild(sendBtn);

  // ===== Assemble =====
  chatWindow.appendChild(header);
  chatWindow.appendChild(messages);
  chatWindow.appendChild(quick);
  chatWindow.appendChild(inputBar);

  document.body.appendChild(button);
  document.body.appendChild(chatWindow);

  // ===== Toggle =====
  button.onclick = () => {
    chatWindow.style.display =
      chatWindow.style.display === "none" ? "flex" : "none";
  };

  // ===== Message UI =====
  function addMessage(text, isUser = false) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = isUser ? "flex-end" : "flex-start";

    const bubble = document.createElement("div");
    bubble.textContent = text;

    bubble.style.maxWidth = "80%";
    bubble.style.padding = "10px 12px";
    bubble.style.borderRadius = isUser
      ? "14px 14px 3px 14px"
      : "14px 14px 14px 3px";

    bubble.style.fontSize = "13px";
    bubble.style.lineHeight = "1.4";

    if (isUser) {
      bubble.style.background = "#5bcdc7";
      bubble.style.color = "#111";
    } else {
      bubble.style.background = "#ffffff";
      bubble.style.border = "1px solid #dbe7ea";
    }

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  // ===== Send =====
  async function send(text) {
    if (!text || !text.trim()) return;

    input.value = "";
    addMessage(text, true);

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
      const reply = data?.content?.[0]?.text || "Sorry — I had trouble responding.";
      addMessage(reply, false);

    } catch (err) {
      addMessage("Connection error. Please try again.", false);
    }
  }

  sendBtn.onclick = () => send(input.value);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input.value);
    }
  });

  // ===== Welcome =====
  addMessage("Hi! I’m Kay from Kashian Bros. How can I help you today?", false);

})();
