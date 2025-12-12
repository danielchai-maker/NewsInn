import axios from "axios";
import { BunAdapter } from "elysia/adapter/bun";

const MODEL = "gemini-1.5-flash";
const API_KEY = Bun.env.GEMINI_API_KEY;

const ALLOWED = [
  "nasional",
  "internasional",
  "ekonomi",
  "olahraga",
  "teknologi",
  "otomotif",
  "gaya hidup",
  "hiburan",
  "politik",
  "lainnya",
];

export async function autocategory(title: string, snippet: string) {
  try {
    if (!API_KEY) {
      console.error("❌ ERROR: GEMINI_API_KEY tidak ditemukan dalam .env");
      return "lainnya";
    }

    const prompt = `
Tentukan kategori berita berdasarkan judul & ringkasan berikut.

Judul: ${title}
Ringkasan: ${snippet}

Pilih hanya *1 kategori* dari daftar berikut:
${ALLOWED.join(", ")}

Balas hanya dengan nama kategori tanpa tambahan kata apa pun.
`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        params: { key: API_KEY },
        headers: { "Content-Type": "application/json" },
      }
    );

    const text =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?.trim()
        .toLowerCase() ?? "lainnya";

    return ALLOWED.includes(text) ? text : "lainnya";
  } catch (err) {
    console.error("❌ AI Category Error:", err);
    return "lainnya";
  }
}
