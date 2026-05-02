import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/emailPassword";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const emailLower = email.toLowerCase();

    await connectDB();
    const existing = await User.findOne({ email: emailLower });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    await User.create({
      name,
      email: emailLower,
      passwordHash,
      emailVerified: true,
      role: "user",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
