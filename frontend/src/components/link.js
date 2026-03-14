export function renderContent(container, text) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  parts.forEach((part) => {
    if (/^https?:\/\//.test(part)) {
      const a = document.createElement("a");
      a.href = part;
      a.textContent = part;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      container.appendChild(a);
    } else {
      container.appendChild(document.createTextNode(part));
    }
  });
}

export function buildPreviewCard(preview) {
  const box = document.createElement("div");
  box.style.border = "1px solid #ccc";
  box.style.marginTop = "0.5em";
  box.style.padding = "0.5em";
  box.style.background = "#fafafa";

  if (preview.image) {
    const img = document.createElement("img");
    img.src = preview.image;
    img.alt = "Preview image";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "200px";
    img.style.display = "block";
    img.style.marginBottom = "0.5em";
    box.appendChild(img);
  }

  if (preview.title) {
    const a = document.createElement("a");
    a.href = preview.url;
    a.textContent = preview.title;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.style.display = "block";
    a.style.fontWeight = "bold";
    box.appendChild(a);
  }

  if (preview.description) {
    const p = document.createElement("p");
    p.textContent = preview.description;
    p.style.margin = "0.25em 0 0 0";
    box.appendChild(p);
  }

  return box;
}

export default function renderLink(item) {
  const el = document.createElement("div");
  el.className = "item";

  const p = document.createElement("p");
  renderContent(p, item.content);
  el.appendChild(p);

  if (item.preview) {
    el.appendChild(buildPreviewCard(item.preview));
  }

  return el;
}
