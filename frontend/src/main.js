import { logger } from "./logger.js";
import { renderItem } from "./components/index.js";

const dropZone = document.getElementById("drop-zone");
const stream = document.getElementById("stream");
const inputForm = document.getElementById("input-form");
const messageInput = document.getElementById("message-input");
const fileInput = document.getElementById("file-input");

const backendPort = import.meta.env.VITE_BACKEND_PORT;
const protocol = location.protocol === "https:" ? "wss" : "ws";
const socket = new WebSocket(
  `${protocol}://${location.hostname}:${backendPort}`
);

socket.onopen = () => {
  logger.debug("[WS] Connected");
};

socket.onclose = () => {
  logger.warn("[WS] Disconnected");
};

socket.onerror = (err) => {
  logger.error("[WS] Socket error", err);
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "init") {
    logger.debug(`[WS] Received message type=init count=${msg.data.length}`);
    msg.data.forEach(addItem);
  } else if (msg.type === "new") {
    logger.debug(`[WS] Received message type=new id=${msg.data.id}`);
    addItem(msg.data);
  }
};

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = messageInput.value.trim();
  if (!content) return;
  await fetch("/api/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  logger.debug("[form] Message submitted");
  messageInput.value = "";
});

dropZone.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  logger.debug(`[file] Uploaded: ${file.name}`);
  fileInput.value = "";
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.background = "#eee";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.background = "";
});

dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropZone.style.background = "";
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  logger.debug(`[file] Uploaded via drop: ${file.name}`);
});

function addItem(item) {
  logger.debug(`[addItem] type=${item.type} id=${item.id}`);

  if (item.type === "file") {
    const el = document.createElement("div");
    el.className = "item";

    let contentEl;
    if (/\.(png|jpe?g|gif|webp)$/i.test(item.filename)) {
      contentEl = document.createElement("img");
      contentEl.src = `/items/${item.path}`;
    } else {
      contentEl = document.createElement("a");
      contentEl.href = `/items/${item.path}`;
      contentEl.download = item.filename;
      contentEl.textContent = item.filename;
    }
    el.appendChild(contentEl);

    const linkIcon = document.createElement("span");
    linkIcon.className = "link-icon";
    linkIcon.textContent = "📎";
    linkIcon.title = "Copy link";
    linkIcon.onclick = () => {
      const fullUrl = `${location.origin}${item.url}`;
      navigator.clipboard.writeText(fullUrl);
      linkIcon.textContent = "✅";
      setTimeout(() => (linkIcon.textContent = "📎"), 1000);
    };
    el.appendChild(linkIcon);

    stream.prepend(el);
  } else {
    const el = renderItem(item);
    stream.prepend(el);
  }
}
