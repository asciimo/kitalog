import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { log } from "../../utils/logger.js";

export async function fetchOG(url) {
  log.debug({ url }, "[OG] Fetching OpenGraph");

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
    log.debug({ status: response.status }, "[OG] HTTP response");

    if (!response.ok) throw new Error("Non-200 response");

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMeta = (prop) => {
      const val = $(`meta[property='og:${prop}']`).attr("content");
      if (val) log.debug({ prop, val }, "[OG] Found OG tag");
      return val || "";
    };

    const preview = {
      title: getMeta("title"),
      description: getMeta("description"),
      image: getMeta("image"),
      url,
    };

    if (!preview.title && !preview.description && !preview.image) {
      log.debug({ url }, "[OG] No OpenGraph tags found");
      return null;
    }

    return preview;
  } catch (err) {
    log.warn({ url, err }, "[OG] Error fetching OpenGraph");
    return null;
  }
}
