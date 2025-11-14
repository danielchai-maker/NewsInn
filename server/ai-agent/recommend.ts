import { Elysia } from "elysia";
import { geminiAgent } from "./index";

export const recommendRoute = new Elysia().post(
  "/api/recommend",
  async ({ body }) => {
    const { title } = body as { title: string };

    const prompt = `
    Berikan 3 judul berita serupa hanya dalam bentuk daftar bullet tanpa penjelasan:
    Judul: ${title}
  `;

    const result = await geminiAgent(prompt);

    // Convert AI output string to array
    const recommendations = result
      .split("\n")
      .map((line: string) => line.replace(/^\d+\.|-/, "").trim())
      .filter((x: string) => x.length > 0)
      .slice(0, 3);

    return { recommendations };
  }
);
