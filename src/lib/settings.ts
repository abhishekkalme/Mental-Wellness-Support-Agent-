import { config } from "@/config/env";

export async function readSettings() {
  return {
    provider: "gemini", // Default to gemini for this hackathon
    apiKey: config.groqApiKey || "", // Reuse groq key or placeholder if needed
    model: "gemini-1.5-flash",
  };
}
