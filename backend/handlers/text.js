export const match = (item) => item.type === "text" && !item.url;

export const process = async (item) => ({ ...item, mediaType: "text" });
