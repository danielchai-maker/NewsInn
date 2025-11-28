import { Elysia } from "elysia";
import { geminiAgent } from "./index";

export const recommendRoute = new Elysia().post(
  "/api/recommend",
  async ({ body }) => {
    const { title } = body as { title: string };

    const prompt = `
    Berikan 3 judul berita lain yang relevan dan mirip.
    Format bullet list:
    - Judul 1
    - Judul 2
    - Judul 3

    Judul: "${title}"
    `;

    const result = await geminiAgent(prompt);

    // Format AI output menjadi array
    const recommendations = result
      .split("\n")
      .map((line: string) => line.replace(/^\d+\.|-/, "").trim())
      .filter((x: string) => x.length > 0)
      .slice(0, 3);

    return { recommendations };
  }
);
