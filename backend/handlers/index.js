import * as twitter from "./link/twitter.js";
import * as reddit from "./link/reddit.js";
import * as facebook from "./link/facebook.js";
import * as instagram from "./link/instagram.js";
import * as bluesky from "./link/bluesky.js";
import * as link from "./link/index.js";
import * as text from "./text.js";

const handlers = [twitter, reddit, instagram, facebook, bluesky, link, text];

export async function enrich(item) {
  const handler = handlers.find((h) => h.match(item));
  return handler ? handler.process(item) : item;
}
