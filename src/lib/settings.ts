import { config } from "@/config/env";
import type { ProviderId } from "@/lib/types";

export async function readSettings(): Promise<{
  provider: ProviderId;
  apiKey: string;
  model: string;
}> {
  return {
    provider: "gemini",
    apiKey: config.geminiApiKey || config.groqApiKey || "",
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  };
}
