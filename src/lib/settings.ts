import { config } from "@/config/env";
import type { ProviderId } from "@/lib/types";

export async function readSettings(): Promise<{
  provider: ProviderId | "groq";
  apiKey: string;
  model: string;
}> {
  return {
    provider: "groq",
    apiKey: config.groqApiKey || config.geminiApiKey || "",
    model: "llama-3.1-8b-instant",
  };
}
