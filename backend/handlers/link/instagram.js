import { fetchOG } from "./_og.js";
import { fetchOEmbed } from "./_oembed.js";

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

export const match = (item) =>
  item.type === "text" &&
  item.url != null &&
  /instagram\.com/.test(item.url);

export const process = async (item) => {
  if (INSTAGRAM_TOKEN) {
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(item.url)}&access_token=${INSTAGRAM_TOKEN}`;
    const preview = await fetchOEmbed(oembedUrl);
    if (preview) return { ...item, mediaType: "instagram", preview };
  }

  const preview = await fetchOG(item.url);
  return { ...item, mediaType: "instagram", preview };
};
