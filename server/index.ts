import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
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

// GET RSS Tempo (dengan flag sumber)
app.get("/api/rss/tempo", async () => {
  const data = await rssParser({ source: "tempo" });

  return (data ?? []).map((item: any) => ({
    ...item,
    source: "tempo",
  }));
});

// GET RSS CNN (dengan flag sumber)
app.get("/api/rss/cnn", async () => {
  const data = await rssParser({ source: "cnn" });

  return (data ?? []).map((item: any) => ({
    ...item,
    source: "cnn",
  }));
});

// AI Recommendation
app.post("/recommend", async ({ body }) => {
  const { title } = body as { title: string };

  const prompt = `
Berikut adalah judul berita: "${title}"
Buat 3 rekomendasi topik berita lain yang sangat mirip dan relevan.
Format bullet list:
- rekomendasi 1
- rekomendasi 2
- rekomendasi 3
`;

  const result = await geminiAgent(prompt);
  return { recommendations: result };
});

app.use(recommendRoute);

app.listen(5000, () => {
  console.log("🚀 Backend Elysia running on http://localhost:5000");
});
