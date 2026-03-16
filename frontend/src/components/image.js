import { renderContent } from "./link.js";

export default function renderImage(item) {
  const el = document.createElement("div");
  el.className = "item";

  const p = document.createElement("p");
  renderContent(p, item.content);
  el.appendChild(p);

  const a = document.createElement("a");
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  const img = document.createElement("img");
  img.src = item.url;
  img.alt = "Shared image";
  img.style.maxWidth = "100%";
  img.style.maxHeight = "400px";
  img.style.display = "block";
  img.style.marginTop = "0.5em";
  img.onerror = () => { img.style.display = "none"; };

  a.appendChild(img);
  el.appendChild(a);

  return el;
}
