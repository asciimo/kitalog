import { fetchOEmbed } from "./_oembed.js";

export const match = (item) =>
  item.type === "text" &&
  item.url != null &&
  /reddit\.com/.test(item.url);

export const process = async (item) => {
  const oembedUrl = `https://www.reddit.com/oembed?url=${encodeURIComponent(item.url)}`;
  const preview = await fetchOEmbed(oembedUrl);
  return { ...item, mediaType: "reddit", preview };
};
