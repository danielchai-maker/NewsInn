import Parser from "rss-parser";
import axios from "axios";
import type { ItemTempo } from "../types/tempo.rss.type";
import type { ItemCnn } from "../types/cnn.rss.type";
import { autocategory } from "../ai-agent/autocategory";

const sources = {
  tempo: "https://rss.tempo.co/",
  cnn: "https://www.cnnindonesia.com/rss",
};

// =========================
// DETECT CATEGORY FROM URL
// =========================
function detectCategoryFromUrl(url: string): string {
  const lower = url.toLowerCase();

  // =====================================
  // TEMPO VIA SUBDOMAIN: nasional.tempo.co
  // =====================================
  const tempoSub = lower.match(/https?:\/\/([a-z]+)\.tempo\.co/);
  if (tempoSub) {
    const sub = tempoSub[1];

    if (sub === "nasional") return "Nasional";
    if (sub === "dunia" || sub === "internasional") return "Internasional";
    if (sub === "bisnis" || sub === "ekonomi") return "Ekonomi";
    if (sub === "tekno") return "Teknologi";
    if (sub === "gaya") return "Lifestyle";
    if (sub === "seleb") return "Hiburan";
    if (sub === "otomotif") return "Otomotif";
  }

  // =====================================
  // TEMPO VIA PATH (cadangan)
  // =====================================
  if (lower.includes("/nasional")) return "Nasional";
  if (lower.includes("/dunia") || lower.includes("/internasional"))
    return "Internasional";
  if (lower.includes("/bisnis") || lower.includes("/ekonomi")) return "Ekonomi";
  if (lower.includes("/sport") || lower.includes("/bola")) return "Olahraga";
  if (lower.includes("/tekno")) return "Teknologi";
  if (lower.includes("/otomotif")) return "Otomotif";
  if (lower.includes("/gaya")) return "Lifestyle";
  if (lower.includes("/seleb") || lower.includes("/hiburan")) return "Hiburan";

  // =====================================
  // CNN VIA PATH
  // =====================================
  const cnnMatch = lower.match(/cnnindonesia\.com\/([^/]+)/);
  if (cnnMatch) {
    const cat = cnnMatch[1];

    if (cat.includes("nasional")) return "Nasional";
    if (cat.includes("internasional") || cat.includes("dunia"))
      return "Internasional";
    if (cat.includes("ekonomi") || cat.includes("bisnis")) return "Ekonomi";
    if (cat.includes("olahraga") || cat.includes("sport")) return "Olahraga";
    if (cat.includes("tekno") || cat.includes("teknologi")) return "Teknologi";
    if (cat.includes("gaya")) return "Lifestyle";
    if (cat.includes("hiburan") || cat.includes("seleb")) return "Hiburan";
    if (cat.includes("politik")) return "Politik";
  }

  return "Lainnya";
}

// =========================
// NORMALIZER KATEGORI (fallback RSS)
// =========================
const normalizeCategory = (raw?: string): string => {
  if (!raw) return "Lainnya";

  const c = raw.toLowerCase();

  if (c.includes("nasional") || c.includes("politik")) return "Nasional";
  if (c.includes("internasional") || c.includes("mancanegara"))
    return "Internasional";
  if (c.includes("ekonomi") || c.includes("bisnis")) return "Ekonomi";
  if (c.includes("olahraga") || c.includes("sport")) return "Olahraga";
  if (c.includes("teknologi") || c.includes("tech")) return "Teknologi";
  if (c.includes("hiburan") || c.includes("entertainment")) return "Hiburan";

  return "Lainnya";
};

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["content:encodedSnippet", "contentEncodedSnippet"],
      ["enclosure", "enclosure"],
      ["category", "category"],
      ["categories", "categories"],
    ],
  },
});

// =========================
// FETCH RSS
// =========================
async function fetchRSS(url: string) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/xml,text/xml",
    },
    timeout: 15000,
  });

  return res.data;
}

// =========================
// MAIN PARSER
// =========================
export const rssParser = async ({ source }: { source: "cnn" | "tempo" }) => {
  try {
    console.log("📥 Fetching RSS from:", source);

    const xml = await fetchRSS(sources[source]);
    const feed = await parser.parseString(xml);

    if (!feed?.items) return [];

    const news = await Promise.all(
      feed.items.map(async (item) => {
        let image: string | undefined;
        let video: string | undefined;

        // CNN → enclosure
        if ((item as ItemCnn).enclosure?.url) {
          const mediaUrl = (item as ItemCnn).enclosure.url;
          if (mediaUrl.endsWith(".mp4")) video = mediaUrl;
          else image = mediaUrl;
        }

        // TEMPO → parse <img> dari contentEncoded
        if (source === "tempo" && !image) {
          const content = (item as ItemTempo).contentEncoded || "";
          const match = content.match(/<img[^>]+src="([^">]+)"/);
          if (match) image = match[1];
        }

        // =========================
        // 1) CARI KATEGORI DARI URL
        // =========================
        const urlCategory = item.link ? detectCategoryFromUrl(item.link) : null;

        if (urlCategory && urlCategory !== "lainnya") {
          return {
            id: item.link,
            title: item.title,
            link: item.link,
            date: item.pubDate || "",
            snippet: (item as any).contentSnippet || "",
            image,
            video,
            category: urlCategory,
            source,
          };
        }

        // =========================
        // 2) CARI DARI RSS CATEGORY
        // =========================
        const rssCategory =
          Array.isArray((item as any).categories) &&
          (item as any).categories.length > 0
            ? (item as any).categories[0]
            : (item as any).category || "";

        const norm = normalizeCategory(rssCategory);

        if (norm !== "lainnya") {
          return {
            id: item.link,
            title: item.title,
            link: item.link,
            date: item.pubDate || "",
            snippet: (item as any).contentSnippet || "",
            image,
            video,
            category: norm,
            source,
          };
        }

        // =========================
        // 3) FALLBACK AI (PALING AKURAT)
        // =========================
        const aiCategory = await autocategory(
          item.title || "",
          (item as any).contentSnippet || ""
        );

        return {
          id: item.link,
          title: item.title,
          link: item.link,
          date: item.pubDate || "",
          snippet: (item as any).contentSnippet || "",
          image,
          video,
          category: aiCategory,
          source,
        };
      })
    );

    console.log("🔎 Contoh 1 item:", JSON.stringify(news[0], null, 2));

    return news;
  } catch (err) {
    console.error(`❌ ERROR FETCHING RSS ${source}:`, err);
    return [];
  }
};
