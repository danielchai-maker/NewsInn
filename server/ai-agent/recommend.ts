import { Elysia } from "elysia";
import { geminiAgent } from "./index";
import { getAllNews } from "../rssData/newsStore";

export const recommendRoute = new Elysia().post(
  "/api/recommend",
  async ({ body }) => {
    const { title } = body as { title: string };

    const allNews = getAllNews();

    // kirim list judul ke AI biar dia pilih mana yg relevan
    const list = allNews
      .slice(0, 200) // jangan kebanyakan
      .map((n) => n.title)
      .join("\n");

    const prompt = `
Berikut adalah daftar judul berita:

${list}

Tugasmu:
- Pilih **3 judul** yang paling mirip / relevan dengan berita berjudul: "${title}"
- Jawab HANYA JSON valid berikut:

{
  "titles": [
    "judul 1",
    "judul 2",
    "judul 3"
  ]
}
    `;

    try {
      const raw = await geminiAgent(prompt);

      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      const parsed = JSON.parse(json);

      const titles: string[] = parsed.titles || [];

      // SEKARANG pencocokan pasti match
      const results = titles
        .map((rec) => {
          const found = allNews.find(
            (item) => item.title.toLowerCase() === rec.toLowerCase()
          );

          if (found) {
            return {
              title: found.title,
              url: found.link,
            };
          }

          return null;
        })
        .filter(Boolean);

      return { recommendations: results };
    } catch (err) {
      console.error("❌ Recommend Error:", err);
      return { recommendations: [] };
    }
  }
);
