import Parser from "rss-parser";
import type { ItemTempo, TempoResponse } from "../types/tempo.rss.type";
import type { ItemCnn, CnnResponse } from "../types/cnn.rss.type";

const sources = {
  tempo: "https://rss.tempo.co/",
  cnn: "https://www.cnnindonesia.com/rss",
};

// 🔥 Kategori Mapper untuk menyeragamkan nama kategori
const normalizeCategory = (raw?: string): string => {
  if (!raw) return "lainnya";

  const c = raw.toLowerCase();

  if (c.includes("nasional") || c.includes("politik")) return "nasional";
  if (c.includes("internasional") || c.includes("mancanegara"))
    return "internasional";
  if (c.includes("ekonomi") || c.includes("bisnis")) return "ekonomi";
  if (c.includes("olahraga") || c.includes("sport")) return "olahraga";
  if (c.includes("teknologi") || c.includes("tech")) return "teknologi";
  if (c.includes("hiburan") || c.includes("entertainment")) return "hiburan";

  return raw; // default: gunakan kategori RSS asli
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
      ["category", "category"], // 🟢 tambahkan category dari RSS
    ],
  },
});

export const rssParser = async ({ source }: { source: "cnn" | "tempo" }) => {
  try {
    const feed = await parser.parseURL(sources[source]);

    const news = feed.items.map((item) => {
      let image: string | undefined;

      // 🔹 Gambar CNN
      if ((item as ItemCnn).enclosure?.url) {
        image = (item as ItemCnn).enclosure?.url;
      }

      // 🔹 Gambar Tempo
      if (source === "tempo" && !image) {
        const content = (item as ItemTempo).contentEncoded || "";
        const match = content.match(/<img[^>]+src="([^">]+)"/);
        if (match) image = match[1];
      }

      // 🔥 Ambil kategori dari RSS (array atau string)
      const rawCategory = Array.isArray((item as any).categories)
        ? (item as any).categories[0]
        : (item as any).category || "lainnya";

      const category = normalizeCategory(rawCategory);

      return {
        title: item.title,
        link: item.link,
        date: item.pubDate,
        image,
        snippet: (item as ItemTempo).contentSnippet,
        category, // 🟢 category dikirim ke frontend
      };
    });

    console.table(
      news.slice(0, 3).map((i) => ({
        title: i.title,
        category: i.category,
        date: i.date,
        link: i.link?.slice(0, 50),
        image: i.image ? i.image.slice(0, 50) : "no image",
      }))
    );

    return news;
  } catch (err) {
    console.error(`❌ Gagal ambil RSS dari ${source}:`, err);
    return [];
  }
};

// 🟢 Jalankan otomatis saat file dieksekusi langsung
rssParser({ source: "tempo" });
