import { renderContent } from "./link.js";

export default function renderText(item) {
  const el = document.createElement("div");
  el.className = "item";

  const p = document.createElement("p");
  renderContent(p, item.content);
  el.appendChild(p);

  return el;
}
