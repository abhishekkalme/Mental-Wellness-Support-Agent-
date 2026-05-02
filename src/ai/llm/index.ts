import { readSettings } from "@/lib/settings";
import { ChatMessage } from "@/lib/types";
import { geminiChat } from "./gemini";
import { openRouterChat } from "./openrouter";
import { ollamaChat } from "./ollama";
import { groqChat } from "./groq";

export type LlmCallParams = {
  system: string;
  messages: ChatMessage[];
  maxOutputTokens?: number;
};

export async function callLlm(params: LlmCallParams): Promise<string> {
  const settings = await readSettings();
  const provider = settings.provider;
  const model =
    settings.model ??
    (provider === "ollama" ? "llama3.1:8b" : "gemini-1.5-flash");

  if (provider === "gemini") {
    return geminiChat({
      apiKey: settings.apiKey,
      model,
      system: params.system,
      messages: params.messages,
      maxOutputTokens: params.maxOutputTokens,
    });
  }

  if (provider === "openrouter") {
    return openRouterChat({
      apiKey: settings.apiKey,
      model,
      system: params.system,
      messages: params.messages,
    });
  }

  if (provider === "ollama") {
    return ollamaChat({
      model,
      system: params.system,
      messages: params.messages,
    });
  }

  if (provider === "groq" as any) {
    return groqChat({
      apiKey: settings.apiKey,
      model,
      system: params.system,
      messages: params.messages,
      maxOutputTokens: params.maxOutputTokens,
    });
  }

  throw new Error("Unsupported provider");
}

