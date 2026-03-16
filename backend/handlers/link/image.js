const IMAGE_URL_RE = /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i;

export const match = (item) =>
  item.type === "text" &&
  item.url != null &&
  IMAGE_URL_RE.test(item.url);

export const process = async (item) => ({
  ...item,
  mediaType: "image",
  preview: null,
});
