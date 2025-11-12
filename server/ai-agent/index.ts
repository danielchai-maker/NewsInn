import { GoogleGenerativeAI, Part } from "@google/generative-ai";

const API_KEY: string = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiAgent = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const parts: Part[] = [
      { text: prompt },
    ];

    const result = await model.generateContent({ contents: [{ parts: parts, role: "" }] });
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to generate content from Gemini AI`);
  }
};
