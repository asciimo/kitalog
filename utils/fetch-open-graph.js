import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function fetchOpenGraph(url) {
  console.log(`[OG] Fetching OpenGraph for: ${url}`);

  try {
    const response = await fetch(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/113.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    console.log(`[OG] HTTP ${response.status} ${response.statusText}`);

    if (!response.ok) throw new Error("Non-200 response");

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMeta = (prop) => {
      const val = $(`meta[property='og:${prop}']`).attr("content");
      if (val) console.log(`[OG] Found og:${prop}:`, val);
      return val || "";
    };

    const preview = {
      title: getMeta("title"),
      description: getMeta("description"),
      image: getMeta("image"),
      url,
    };

    if (!preview.title && !preview.description && !preview.image) {
      console.log(`[OG] No OpenGraph tags found.`);
      return null;
    }

    return preview;
  } catch (err) {
    console.warn(`[OG] Error fetching OpenGraph for ${url}:\n`, err);
    return null;
  }
}
