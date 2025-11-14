import Parser from "rss-parser";
import type { ItemTempo, TempoResponse } from "../types/tempo.rss.type";
import type { ItemCnn, CnnResponse } from "../types/cnn.rss.type";

const sources = {
  tempo: "https://rss.tempo.co/",
  cnn: "https://www.cnnindonesia.com/rss",
};

const parser = new Parser<TempoResponse | CnnResponse, ItemTempo | ItemCnn>({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NewsApp/1.0; +https://example.com)",
  },
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["content:encodedSnippet", "contentEncodedSnippet"],
      ["enclosure", "enclosure"],
    ],
  },
});

export const rssParser = async ({ source }: { source: "cnn" | "tempo" }) => {
  try {
    const feed = await parser.parseURL(sources[source]);
    const news = feed.items.map((item) => {
      let image: string | undefined;

      // 🔹 Gambar dari CNN via <enclosure>
      if ((item as ItemCnn).enclosure?.url) {
        image = (item as ItemCnn).enclosure?.url;
      }

      // 🔹 Gambar dari Tempo via <content:encoded>
      if (source === "tempo" && !image) {
        const content = (item as ItemTempo).contentEncoded || "";
        const match = content.match(/<img[^>]+src="([^">]+)"/);
        if (match) image = match[1];
      }

      return {
        title: item.title,
        link: item.link,
        date: item.pubDate,
        image,
        snippet: (item as ItemTempo).contentSnippet,
      };
    });

    console.table(
      news.slice(0, 3).map((i) => ({
        title: i.title,
        date: i.date,
        link: i.link?.slice(0, 50),
        image: i.image ? i.image.slice(0, 50) : "no image",
      }))
    );

    return news;
  } catch (err) {
    console.error(`❌ Gagal ambil RSS dari ${source}:`, err);
  }
};

// 🟢 Jalankan otomatis saat file dieksekusi langsung
rssParser({ source: "tempo" });
