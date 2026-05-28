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
  button.style.background = "#000";
  button.style.color = "#88EAE4";
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
  header.style.background = "#000";
  header.style.color = "#fff";

  // Messages
  const messages = document.createElement("div");
  messages.style.flex = "1";
  messages.style.padding = "10px";
  messages.style.overflowY = "auto";

  // Input Area
  const inputArea = document.createElement("div");
  inputArea.style.display = "flex";
  inputArea.style.borderTop = "1px solid #eee";

  const input = document.createElement("input");
  input.placeholder = "Type a message...";
  input.style.flex = "1";
  input.style.padding = "10px";
  input.style.border = "none";

  const send = document.createElement("button");
  send.innerHTML = "Send";
  send.style.padding = "10px";
  send.style.border = "none";
  send.style.background = "#000";
  send.style.color = "#fff";

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

})();
