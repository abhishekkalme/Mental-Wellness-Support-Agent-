import { ChatMessage } from "@/lib/types";

export type OpenRouterChatParams = {
  apiKey: string;
  model: string; // e.g. "google/gemini-2.0-flash"
  system: string;
  messages: ChatMessage[];
};

export async function openRouterChat(params: OpenRouterChatParams): Promise<string> {
  const { apiKey, model, system, messages } = params;
  if (!apiKey) throw new Error("Missing OpenRouter API key");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ 
          role: m.role === "agent" ? "assistant" : m.role, 
          content: m.content 
        })),
      ],
      temperature: 0.6,
      top_p: 0.9,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenRouter error (${res.status}): ${txt || res.statusText}`);
  }
  const json = (await res.json().catch(() => null)) as any;
  const text = json?.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("Empty model response");
  return String(text).trim();
}

