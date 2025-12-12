// server/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import dotenv from "dotenv";
import { rssParser } from "./rssData/index";
import { recommendRoute } from "./ai-agent/recommend";
import { authRoute } from "./authRoute";
import { verifyToken } from "./authMiddleware";
import { t } from "elysia";
import { logger } from "@grotto/logysia";
import * as cheerio from "cheerio";
import { extractCNNVideo } from "./cnnVideo";

import { updateNewsStore } from "./rssData/newsStore";
import { getAllNews } from "./rssData/newsStore";

dotenv.config();

const app = new Elysia();

// Update RSS store saat server start
await updateNewsStore();

// Update setiap 10 menit
setInterval(updateNewsStore, 10 * 60 * 1000);

// =====================================
// Logger
// =====================================
app.use(
  logger({
    logIP: false,
    writer: {
      write(msg: string) {
        console.log(msg);
      },
    },
  })
);

// =====================================
// Error Handler
// =====================================
app.onError(({ code, error, request }) => {
  console.error("🔥 GLOBAL ERROR:", code);
  console.error("URL:", request?.url);
  console.error("DETAIL:", error);
  return { success: false, message: "Internal Server Error" };
});

// =====================================
// CORS
// =====================================
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);

// =====================================
// Local News Storage
// =====================================
interface NewsItem {
  id: string;
  title: string;
  image: string;
  summary: string;
  content: string;
  category: string;
  date: string;
  ownerId?: string;
}

const filePath = "./newsData.json";

const loadNews = async (): Promise<NewsItem[]> => {
  const fs = await import("fs");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const saveNews = async (data: NewsItem[]) => {
  const fs = await import("fs");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// GET all local news
app.get("/api/news", async () => loadNews());

// CREATE local news
app.post(
  "/api/news",
  async ({ body, headers }) => {
    const decoded = verifyToken(headers["authorization"] as string);
    if (!decoded) return { success: false, message: "Unauthorized" };

    const list = await loadNews();

    const newNews: NewsItem = {
      id: Date.now().toString(),
      title: body.title,
      image: body.image,
      summary: body.summary,
      content: body.content,
      category: body.category,
      date: new Date().toISOString(),
      ownerId: decoded.userId,
    };

    list.push(newNews);
    await saveNews(list);

    return {
      success: true,
      message: "Berita berhasil ditambahkan!",
      data: newNews,
    };
  },
  {
    body: t.Object({
      title: t.String(),
      image: t.String(),
      summary: t.String(),
      content: t.String(),
      category: t.String(),
    }),
  }
);

// DELETE local news
app.delete("/api/news/:id", async ({ params, headers }) => {
  const fs = await import("fs");

  const decoded = verifyToken(headers["authorization"] as string);
  if (!decoded) return { success: false, message: "Unauthorized" };

  if (!fs.existsSync(filePath))
    return { success: false, message: "Data tidak ditemukan" };

  const list: NewsItem[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const item = list.find((n) => n.id === params.id);

  if (!item) return { success: false, message: "Berita tidak ditemukan" };
  if (String(item.ownerId) !== String(decoded.userId))
    return { success: false, message: "Forbidden" };

  const updated = list.filter((n) => n.id !== params.id);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

  return { success: true, id: params.id };
});

// =====================================
// RSS Routes
// =====================================
app.get("/api/rss/tempo", async () => {
  const data = await rssParser({ source: "tempo" });
  return (data ?? []).map((item) => ({ ...item, source: "tempo" }));
});

app.get("/api/rss/cnn", async () => {
  const data = await rssParser({ source: "cnn" });
  return (data ?? []).map((item) => ({ ...item, source: "cnn" }));
});

// =====================================
// DETAIL SCRAPER
// =====================================
app.get("/api/rss/detail", async ({ query }) => {
  const { source, url } = query;

  if (!source || !url)
    return { success: false, message: "source dan url wajib diisi" };

  try {
    const html = await fetch(url).then((r) => r.text());
    const $ = cheerio.load(html);

    if (source === "tempo") {
      return {
        success: true,
        source: "tempo",
        title: $("h1").first().text().trim(),
        image:
          $("article img").attr("src") ||
          $("meta[property='og:image']").attr("content"),
        content: $("article").text().trim(),
      };
    }

    if (source === "cnn") {
      const paragraphs: string[] = [];
      $("div.detail_text p").each((_i, el) => {
        const text = $(el).text().trim();
        if (text.length > 30) paragraphs.push(text);
      });

      return {
        success: true,
        source: "cnn",
        title: $("h1").first().text().trim(),
        content: paragraphs.join("\n\n"),
        video:
          $("video source").attr("src") ||
          $("meta[property='og:video']").attr("content") ||
          $("meta[itemprop='contentURL']").attr("content") ||
          null,
      };
    }

    return { success: false, message: "Source tidak dikenali" };
  } catch (err) {
    return { success: false, message: "Gagal scraping detail", err };
  }
});

// =====================================
// VIDEO CNN
// =====================================
app.get("/api/rss/cnn-video", async ({ query }) => {
  const url = query.url as string;
  if (!url) return { success: false, message: "URL CNN wajib diberikan" };

  const videoUrl = await extractCNNVideo(url);
  return {
    success: true,
    hasVideo: !!videoUrl,
    videoUrl,
  };
});

// =====================================
// Auth & AI
// =====================================
app.use(authRoute);
app.use(recommendRoute);

// =====================================
// Debug
// =====================================
app.onBeforeHandle(({ request }) => {
  console.log("📩 Incoming:", request.method, request.url);
});

app.get("/api/categories", () => {
  const rssNews = getAllNews();
  const localNews = JSON.parse(
    require("fs").readFileSync("./newsData.json", "utf8")
  );

  const categories = new Set<string>();

  rssNews.forEach((n) => {
    if (n.category) categories.add(n.category);
  });

  localNews.forEach((n: any) => {
    if (n.category) categories.add(n.category);
  });

  return Array.from(categories);
});

app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
