import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export const verifyToken = (authHeader?: string) => {
  console.log("📌 VERIFY HEADER:", authHeader); // DEBUG FE KIRIM TOKEN ATAU TIDAK

  if (!authHeader || typeof authHeader !== "string") return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2) return null;

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;

  try {
    console.log("📌 TOKEN:", token); // DEBUG TOKEN
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    return decoded;
  } catch (err) {
    console.log("❌ JWT ERROR:", err);
    return null;
  }
};
