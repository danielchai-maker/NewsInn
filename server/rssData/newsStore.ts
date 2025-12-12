import { rssParser } from "./index";

export interface StoredNews {
  id: string;
  title: string;
  link: string;
  image?: string;
  video?: string;
  date?: string;
  snippet?: string;
  category: string;
  source: "cnn" | "tempo";
}

let allNews: StoredNews[] = [];

/**
 * 🔥 Fetch semua berita CNN + TEMPO, lalu simpan ke memory
 */
export const updateNewsStore = async () => {
  try {
    const [cnn, tempo] = await Promise.all([
      rssParser({ source: "cnn" }),
      rssParser({ source: "tempo" }),
    ]);

    allNews = [
      ...cnn.map((n) => ({
        id: n.link ?? n.title ?? crypto.randomUUID(),
        title: n.title ?? "No Title",
        link: n.link ?? "",
        image: n.image || undefined,
        video: n.video || undefined,
        date: n.date || "",
        snippet: n.snippet || "",
        category: n.category || "lainnya",
        source: "cnn" as const,
      })),

      ...tempo.map((n) => ({
        id: n.link ?? n.title ?? crypto.randomUUID(),
        title: n.title ?? "No Title",
        link: n.link ?? "",
        image: n.image || undefined,
        video: n.video || undefined,
        date: n.date || "",
        snippet: n.snippet || "",
        category: n.category || "lainnya",
        source: "tempo" as const,
      })),
    ];

    console.log(`📡 News Store Updated (${allNews.length} items)`);
  } catch (err) {
    console.error("❌ Gagal update news store:", err);
  }
};

/**
 * Getter untuk ambil seluruh berita
 */
export const getAllNews = () => allNews;

/**
 * Getter ambil berita berdasarkan ID
 */
export const getNewsById = (id: string) =>
  allNews.find((n) => n.id === id) || null;

/**
 * Getter berdasarkan kategori
 */
export const getNewsByCategory = (category: string) =>
  allNews.filter((n) => n.category === category.toLowerCase());
