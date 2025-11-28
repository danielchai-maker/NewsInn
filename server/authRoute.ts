// server/authRoute.ts
import { Elysia } from "elysia";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export const authRoute = new Elysia({ prefix: "/api/auth" })

  // REGISTER USER
  .post("/register", async ({ body }) => {
    try {
      console.log("REGISTER BODY:", body); // DEBUG

      const { name, email, password } = body as any;

      if (!email || !password) {
        return { success: false, message: "Email dan password harus diisi" };
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return { success: false, message: "Email sudah terdaftar" };

      const hashed = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("REGISTER → TOKEN GENERATED:", token); // DEBUG

      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          token,
        },
      };
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      return { success: false, message: "Internal Server Error" };
    }
  })

  // LOGIN USER
  .post("/login", async ({ body }) => {
    try {
      console.log("LOGIN BODY:", body); // DEBUG

      const { email, password } = body as any;

      if (!email || !password) {
        return { success: false, message: "Email dan password harus diisi" };
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return { success: false, message: "User tidak ditemukan" };

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return { success: false, message: "Password salah" };

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("LOGIN → TOKEN GENERATED:", token); // DEBUG

      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          token,
        },
      };
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      return { success: false, message: "Internal Server Error" };
    }
  });
