import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { newsData } from "./data/newsData";
import type { NewsItem } from "./data/newsData";
import { rssParser } from "./rssData/index";
import { geminiAgent } from "./ai-agent/index";
import { recommendRoute } from "./ai-agent/recommend";
import dotenv from "dotenv";
dotenv.config();

const app = new Elysia();

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// RSS Tempo
app.get("/api/rss/tempo", async () => {
  const data = (await rssParser({ source: "tempo" })) ?? [];
  return data;
});

// RSS CNN
app.get("/api/rss/cnn", async () => {
  const data = (await rssParser({ source: "cnn" })) ?? [];
  return data;
});

// --- AI Recommendation Route ---
app.post("/recommend", async ({ body }) => {
  const { title } = body as { title: string };

  const prompt = `
Berikut adalah judul berita: "${title}"
Buat 3 rekomendasi topik berita lain yang sangat mirip dan relevan.
Format hanya bullet list contoh:
- rekomendasi 1
- rekomendasi 2
- rekomendasi 3
Tanpa penjelasan tambahan.
`;

  const result = await geminiAgent(prompt);

  return { recommendations: result };
});

//all news
app.get("/api/news", () => newsData);

// news by id
app.get("/api/news/:id", ({ params }) => {
  const item = newsData.find((i) => i.id === Number(params.id));
  if (!item) return { error: "Not found" };
  return item;
});

app.use(recommendRoute);

app.listen(5000, () => {
  console.log("🚀 Backend Elysia running on http://localhost:5000");
});
