import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { newsData } from "./data/newsData";
import type { NewsItem } from "./data/newsData";
import { rssParser } from "./rssData/index.ts";

const app = new Elysia();

// ✅ aktifkan CORS agar bisa diakses dari frontend (port 5173)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ GET berita dari Tempo (aman terhadap undefined)
app.get("/api/rss/tempo", async () => {
  const data = (await rssParser({ source: "tempo" })) ?? [];
  return data;
});

// ✅ GET berita dari CNN (aman terhadap undefined)
app.get("/api/rss/cnn", async () => {
  const data = (await rssParser({ source: "cnn" })) ?? [];
  return data;
});

// ✅ GET semua berita
app.get("/api/news", () => newsData, {
  response: t.Array(
    t.Object({
      id: t.Number(),
      title: t.String(),
      image: t.String(),
      summary: t.String(),
      content: t.String(),
      category: t.String(),
    })
  ),
});

// ✅ GET berita per kategori
app.get(
  "/api/news/category/:category",
  ({ params }) =>
    newsData.filter(
      (item) => item.category.toLowerCase() === params.category.toLowerCase()
    ),
  {
    params: t.Object({ category: t.String() }),
    response: t.Array(
      t.Object({
        id: t.Number(),
        title: t.String(),
        image: t.String(),
        summary: t.String(),
        content: t.String(),
        category: t.String(),
      })
    ),
  }
);

// ✅ GET detail berita by id
app.get(
  "/api/news/:id",
  ({ params }) => {
    const id = Number(params.id);
    const item = newsData.find((i) => i.id === id);
    if (!item) return { error: "Not found" };
    return item;
  },
  {
    params: t.Object({ id: t.String() }),
    response: t.Union([
      t.Object({
        id: t.Number(),
        title: t.String(),
        image: t.String(),
        summary: t.String(),
        content: t.String(),
        category: t.String(),
      }),
      t.Object({ error: t.String() }),
    ]),
  }
);

// ✅ POST berita baru
app.post(
  "/api/news",
  ({ body }) => {
    const newId =
      newsData.length > 0 ? newsData[newsData.length - 1].id + 1 : 1;
    const newArticle: NewsItem = { id: newId, ...body };
    newsData.push(newArticle);
    return { message: "Berita berhasil ditambahkan", data: newArticle };
  },
  {
    body: t.Object({
      title: t.String(),
      image: t.String(),
      summary: t.String(),
      content: t.String(),
      category: t.String(),
    }),
    response: t.Object({
      message: t.String(),
      data: t.Object({
        id: t.Number(),
        title: t.String(),
        image: t.String(),
        summary: t.String(),
        content: t.String(),
        category: t.String(),
      }),
    }),
  }
);

// ✅ DELETE berita by ID
app.delete(
  "/api/news/:id",
  ({ params }) => {
    const id = Number(params.id);
    const index = newsData.findIndex((item) => item.id === id);

    if (index === -1) {
      return { error: "Berita tidak ditemukan" };
    }

    const deleted = newsData.splice(index, 1)[0];
    return { message: "Berita berhasil dihapus", data: deleted };
  },
  {
    params: t.Object({ id: t.String() }),
    response: t.Union([
      t.Object({
        message: t.String(),
        data: t.Object({
          id: t.Number(),
          title: t.String(),
          image: t.String(),
          summary: t.String(),
          content: t.String(),
          category: t.String(),
        }),
      }),
      t.Object({ error: t.String() }),
    ]),
  }
);

app.listen(5000, () => {
  console.log("🚀 Backend Elysia running on http://localhost:5000");
});
