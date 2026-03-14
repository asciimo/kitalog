import renderText from "./text.js";
import renderLink from "./link.js";
import renderTwitter from "./twitter.js";
import renderReddit from "./reddit.js";

const components = {
  text: renderText,
  link: renderLink,
  twitter: renderTwitter,
  reddit: renderReddit,
  facebook: renderLink,
  instagram: renderLink,
  bluesky: renderLink,
};

export function renderItem(item) {
  const render = components[item.mediaType] ?? components.text;
  return render(item);
}
