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

dotenv.config();

const app = new Elysia();

// Logger
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

// Global error handler
app.onError(({ code, error, request }) => {
  console.error("🔥 GLOBAL ERROR:", code);
  console.error("URL:", request?.url);
  console.error("DETAIL:", error);
  return { success: false, message: "Internal Server Error" };
});

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);

// Local news storage
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

// Load existing
const loadNews = async (): Promise<NewsItem[]> => {
  const fs = await import("fs");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Save news
const saveNews = async (data: NewsItem[]) => {
  const fs = await import("fs");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// GET all local news
app.get("/api/news", async () => {
  return await loadNews();
});

// CREATE news
app.post(
  "/api/news",
  async ({ body, headers }) => {
    const decoded = verifyToken(headers["authorization"] as string);
    if (!decoded) return { success: false, message: "Unauthorized" };

    const { title, image, summary, content, category } = body;
    const list = await loadNews();

    const newNews: NewsItem = {
      id: Date.now().toString(),
      title,
      image,
      summary,
      content,
      category,
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

// DELETE news
app.delete("/api/news/:id", async ({ params, headers }) => {
  const fs = await import("fs");
  const id = params.id;

  const decoded = verifyToken(headers["authorization"] as string);
  if (!decoded) return { success: false, message: "Unauthorized" };

  if (!fs.existsSync(filePath))
    return { success: false, message: "Data tidak ditemukan" };

  const list: NewsItem[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const item = list.find((n) => n.id === id);
  if (!item) return { success: false, message: "Berita tidak ditemukan" };

  if (String(item.ownerId) !== String(decoded.userId))
    return { success: false, message: "Forbidden" };

  const updated = list.filter((n) => n.id !== id);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

  return { success: true, message: "Berita berhasil dihapus", id };
});

// RSS routes
app.get("/api/rss/tempo", async () => {
  const data = await rssParser({ source: "tempo" });
  return (data ?? []).map((item) => ({ ...item, source: "tempo" }));
});

app.get("/api/rss/cnn", async () => {
  const data = await rssParser({ source: "cnn" });
  return (data ?? []).map((item) => ({ ...item, source: "cnn" }));
});

// Auth & AI routes
app.use(authRoute);
app.use(recommendRoute);

// Debug incoming
app.onBeforeHandle(({ request }) => {
  console.log("📩 Incoming:", request.method, request.url);
});

// Start server
app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
