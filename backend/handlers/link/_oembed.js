import fetch from "node-fetch";
import { log } from "../../utils/logger.js";

export async function fetchOEmbed(endpointUrl) {
  log.debug({ url: endpointUrl }, "[oEmbed] Fetching");

  try {
    const response = await fetch(endpointUrl, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Kitalog/1.0)",
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error(`Non-200: ${response.status}`);

    const data = await response.json();
    log.debug({ title: data.title }, "[oEmbed] Got response");

    return {
      title: data.title || null,
      description: data.author_name || null,
      image: data.thumbnail_url || null,
      url: data.url || endpointUrl,
      author: data.author_name || null,
      authorUrl: data.author_url || null,
      platform: data.provider_name || null,
    };
  } catch (err) {
    log.warn({ url: endpointUrl, err }, "[oEmbed] Error fetching");
    return null;
  }
}
