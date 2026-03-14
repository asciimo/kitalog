import { fetchOG } from "./_og.js";

export const match = (item) =>
  item.type === "text" &&
  item.url != null &&
  /facebook\.com|fb\.com/.test(item.url);

export const process = async (item) => {
  const preview = await fetchOG(item.url);
  return { ...item, mediaType: "facebook", preview };
};
