import { NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/types";
import { callLlm } from "@/ai/llm";
import { buildMultilingualSystemPrompt, getLanguageById } from "@/lib/chat/indianLanguages";

type IncomingMsg = { id: string; role: "user" | "agent"; content: string; timestamp?: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body.messages as IncomingMsg[] | undefined;
    const chatLanguageId = typeof body.chatLanguage === "string" ? body.chatLanguage : "en";
    const mode = body.mode as { safeMode?: boolean; liteMode?: boolean } | undefined;
    const context = body.context as { firstGen?: boolean } | undefined;

    if (!rawMessages?.length) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    const lang = getLanguageById(chatLanguageId);
    const system = buildMultilingualSystemPrompt(lang, {
      safeMode: Boolean(mode?.safeMode),
      liteMode: Boolean(mode?.liteMode),
      firstGen: Boolean(context?.firstGen),
    });

    const messages: ChatMessage[] = rawMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp ?? new Date().toISOString(),
    }));

    const reply = await callLlm({
      system,
      messages,
      maxOutputTokens: mode?.liteMode ? 256 : 768,
    });

    return NextResponse.json({
      risk: "none" as const,
      reply,
      languageId: lang.id,
    });
  } catch (error) {
    console.error("[api/chat]", error);
    return NextResponse.json(
      {
        risk: "none" as const,
        reply:
          "I’m having trouble reaching the AI service right now. Please check your API key in Admin settings (Gemini) and try again.",
      },
      { status: 200 }
    );
  }
}
