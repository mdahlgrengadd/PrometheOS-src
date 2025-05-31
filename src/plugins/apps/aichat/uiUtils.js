// UI utilities for rendering and DOM manipulation
import { marked } from "https://unpkg.com/marked@15.0.7/lib/marked.esm.js";
import DOMPurify from "https://unpkg.com/dompurify@3.2.4/dist/purify.es.mjs";

export function render(text) {
  return DOMPurify.sanitize(marked.parse(text));
}

export function appendMessage(message) {
  const chatBox = document.getElementById("chat-box");
  const container = document.createElement("div");
  container.classList.add("message-container");
  const newMessage = document.createElement("div");
  newMessage.classList.add("message");

  if (message.role === "user") {
    container.classList.add("user");
    newMessage.textContent = message.content;
  } else {
    container.classList.add("assistant");
    newMessage.classList.add("markdown");
    newMessage.innerHTML = render(message.content);
  }

  container.appendChild(newMessage);
  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
}

export function updateLastMessage(content) {
  const messageDoms = document.querySelectorAll("#chat-box div.message");
  const lastMessageDom = messageDoms[messageDoms.length - 1];
  lastMessageDom.innerHTML = render(content);
}

export function updateEngineInitProgressCallback(report) {
  console.log("initialize", report.progress);
  document.getElementById("download-status").textContent = report.text;
}
