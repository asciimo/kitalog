import { renderContent, buildPreviewCard } from "./link.js";

export default function renderTwitter(item) {
  const el = document.createElement("div");
  el.className = "item";

  const p = document.createElement("p");
  renderContent(p, item.content);
  el.appendChild(p);

  if (item.preview) {
    const card = buildPreviewCard(item.preview);

    if (item.preview.author) {
      const authorLine = document.createElement("p");
      authorLine.style.margin = "0.25em 0 0 0";
      authorLine.style.fontSize = "0.9em";
      authorLine.style.color = "#666";

      const badge = document.createElement("span");
      badge.textContent = "𝕏 ";
      badge.style.fontWeight = "bold";
      authorLine.appendChild(badge);

      authorLine.appendChild(document.createTextNode("by "));

      if (item.preview.authorUrl) {
        const a = document.createElement("a");
        a.href = item.preview.authorUrl;
        a.textContent = `@${item.preview.author}`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        authorLine.appendChild(a);
      } else {
        authorLine.appendChild(document.createTextNode(`@${item.preview.author}`));
      }

      card.appendChild(authorLine);
    }

    el.appendChild(card);
  }

  return el;
}
