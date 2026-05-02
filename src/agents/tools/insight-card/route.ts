import { NextResponse } from "next/server";
import { callLlm } from "@/lib/llm";

type Req = {
  bestMoment: string;
  worstMoment: string;
  oneImprovement: string;
  tone?: "hinglish" | "english";
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Req | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const system = [
    "You create a single daily Insight Card for a student.",
    "Output format MUST be exactly:",
    "Title: <short title>",
    "Pattern: <1 sentence>",
    "Try tomorrow:",
    "- <action 1>",
    "- <action 2>",
    "Keep it non-judgmental and practical.",
    "No medical claims.",
    body.tone === "english" ? "Write in English." : "Write in Hinglish.",
  ].join("\n");

  const user = [
    `Best moment: ${body.bestMoment}`,
    `Worst moment: ${body.worstMoment}`,
    `One improvement: ${body.oneImprovement}`,
  ].join("\n");

  const card = await callLlm({
    system,
    messages: [{ role: "user", content: user }],
    maxOutputTokens: 250,
  });

  return NextResponse.json({ card });
}

