import { fetchOG } from "./_og.js";

export const match = (item) =>
  item.type === "text" && item.url != null;

export const process = async (item) => {
  const preview = await fetchOG(item.url);
  return { ...item, mediaType: "link", preview };
};
