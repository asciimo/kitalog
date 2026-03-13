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

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "init") {
    msg.data.forEach(addItem);
  } else if (msg.type === "new") {
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
  fileInput.value = "";
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.background = "#eee";
});

dropZone.addEventListener("dragleave", (e) => {
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
});

function addItem(item) {
  const el = document.createElement("div");
  el.className = "item";

  let contentEl;
  if (item.type === "text") {
    contentEl = document.createElement("p");
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = item.content.split(urlRegex);

    parts.forEach((part) => {
      if (urlRegex.test(part)) {
        const link = document.createElement("a");
        link.href = part;
        link.textContent = part;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        contentEl.appendChild(link);
      } else {
        contentEl.appendChild(document.createTextNode(part));
      }
    });
  } else if (item.type === "file") {
    if (/\.(png|jpe?g|gif|webp)$/i.test(item.filename)) {
      contentEl = document.createElement("img");
      contentEl.src = `/items/${item.path}`;
    } else {
      contentEl = document.createElement("a");
      contentEl.href = `/items/${item.path}`;
      contentEl.download = item.filename;
      contentEl.textContent = item.filename;
    }
  }

  if (contentEl) el.appendChild(contentEl);

  // 🔗 Add OG preview box if present
  if (item.preview) {
    const previewBox = document.createElement("div");
    previewBox.style.border = "1px solid #ccc";
    previewBox.style.marginTop = "0.5em";
    previewBox.style.padding = "0.5em";
    previewBox.style.background = "#fafafa";

    if (item.preview.image) {
      const img = document.createElement("img");
      img.src = item.preview.image;
      img.alt = "Preview image";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "200px";
      img.style.display = "block";
      img.style.marginBottom = "0.5em";
      previewBox.appendChild(img);
    }

    if (item.preview.title) {
      const link = document.createElement("a");
      link.href = item.preview.url;
      link.textContent = item.preview.title;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "block";
      link.style.fontWeight = "bold";
      previewBox.appendChild(link);
    }

    if (item.preview.description) {
      const desc = document.createElement("p");
      desc.textContent = item.preview.description;
      desc.style.margin = "0.25em 0 0 0";
      previewBox.appendChild(desc);
    }

    el.appendChild(previewBox);
  }

  // 📎 Link icon
  if (item.url) {
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
  }

  stream.prepend(el);
}
