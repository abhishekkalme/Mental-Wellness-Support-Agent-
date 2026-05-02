import { NextResponse } from "next/server";
import { callLlm } from "@/lib/llm";

type Req = {
  type: "extension" | "clarification" | "workload";
  course?: string;
  deadline?: string;
  tone?: "very polite" | "neutral";
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Req | null;
  if (!body?.type) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const system = [
    "You write a short, polite message to a professor/teacher.",
    "Keep it professional, concise, and not overly detailed about health.",
    "Output should be copy-paste ready.",
    "No emojis.",
  ].join("\n");

  const user = [
    `Type: ${body.type}`,
    `Course: ${body.course ?? "unknown"}`,
    `Deadline: ${body.deadline ?? "unknown"}`,
    `Tone: ${body.tone ?? "very polite"}`,
    "Context: Student feels stressed and wants a respectful message.",
  ].join("\n");

  const text = await callLlm({
    system,
    messages: [{ role: "user", content: user }],
    maxOutputTokens: 220,
  });

  return NextResponse.json({ text });
}

