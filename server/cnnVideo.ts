import axios from "axios";
import * as cheerio from "cheerio";

export async function extractCNNVideo(url: string) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(data);

    // STEP 1: HTML5 Video
    const html5 = $("video source").attr("src");
    if (html5) return html5;

    // STEP 2: iframe player video CNN
    let iframeSrc: string | null = null;
    $("iframe").each((_i, el) => {
      const src = $(el).attr("src");
      if (src && src.includes("video")) iframeSrc = src;
    });
    if (iframeSrc) return iframeSrc;

    // STEP 3: meta og:video
    const og = $("meta[property='og:video']").attr("content");
    if (og) return og;

    // STEP 4: data-video-src
    const dv = $("[data-video-src]").attr("data-video-src");
    if (dv) return dv;

    return null;
  } catch (err) {
    console.error("❌ extractCNNVideo ERROR:", err);
    return null;
  }
}
