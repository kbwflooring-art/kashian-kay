(function () {

  // Avoid loading twice
  if (document.getElementById("native-chatbot")) return;

  // ===== Chat Button =====
  const button = document.createElement("button");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.borderRadius = "50%";
  button.style.border = "none";
  button.style.background = "#88EAE4";
  button.style.color = "#000";
  button.style.fontSize = "24px";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";

  // ===== Chat Window =====
  const chatWindow = document.createElement("div");
  chatWindow.id = "native-chatbot";
  chatWindow.style.position = "fixed";
  chatWindow.style.bottom = "90px";
  chatWindow.style.right = "20px";
  chatWindow.style.width = "350px";
  chatWindow.style.height = "500px";
  chatWindow.style.background = "#fff";
  chatWindow.style.border = "1px solid #ccc";
  chatWindow.style.borderRadius = "12px";
  chatWindow.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  chatWindow.style.display = "none";
  chatWindow.style.flexDirection = "column";
  chatWindow.style.overflow = "hidden";
  chatWindow.style.zIndex = "9999";

  // Header
  const header = document.createElement("div");
  header.innerHTML = "Chat Assistant";
  header.style.padding = "12px";
  header.style.background = "#88EAE4";
  header.style.color = "#fff";
  header.style.fontWeight = "bold";

  // Messages
  const messages = document.createElement("div");
  messages.style.flex = "1";
  messages.style.padding = "10px";
  messages.style.overflowY = "auto";
  messages.style.fontFamily = "Arial";

  function addMessage(text, type = "bot") {
    const msg = document.createElement("div");
    msg.innerText = text;
    msg.style.margin = "6px 0";
    msg.style.padding = "8px 10px";
    msg.style.borderRadius = "8px";
    msg.style.maxWidth = "80%";

    if (type === "user") {
      msg.style.marginLeft = "auto";
      msg.style.background = "#e6f7f6";
      msg.style.textAlign = "right";
    } else {
      msg.style.background = "#f1f1f1";
    }

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Input Area
  const inputArea = document.createElement("div");
  inputArea.style.display = "flex";
  inputArea.style.borderTop = "1px solid #eee";

  const input = document.createElement("input");
  input.placeholder = "Type a message...";
  input.style.flex = "1";
  input.style.padding = "10px";
  input.style.border = "none";
  input.style.outline = "none";

  const send = document.createElement("button");
  send.innerHTML = "Send";
  send.style.padding = "10px";
  send.style.border = "none";
  send.style.background = "#88EAE4";
  send.style.color = "#000";
  send.style.cursor = "pointer";

  inputArea.appendChild(input);
  inputArea.appendChild(send);

  chatWindow.appendChild(header);
  chatWindow.appendChild(messages);
  chatWindow.appendChild(inputArea);

  document.body.appendChild(button);
  document.body.appendChild(chatWindow);

  // Toggle chatbot
  button.onclick = () => {
    chatWindow.style.display =
      chatWindow.style.display === "none" ? "flex" : "none";
  };

  // ===== SEND MESSAGE =====
  async function sendMessage() {

    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    const loadingId = Date.now();
    const loadingMsg = document.createElement("div");
    loadingMsg.innerText = "Thinking...";
    loadingMsg.id = loadingId;
    messages.appendChild(loadingMsg);

    try {

      const response = await fetch(
        "https://warm-dolphin-79489e.netlify.app/.netlify/functions/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: text
              }
            ]
          })
        }
      );

      const data = await response.json();

      // remove loading
      loadingMsg.remove();

      const reply = data.reply || "No response from server.";

      addMessage(reply, "bot");

    } catch (err) {

      console.error(err);

      loadingMsg.remove();

      addMessage("Connection error. Please try again.", "bot");
    }
  }

  // Events
  send.onclick = sendMessage;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

})();
