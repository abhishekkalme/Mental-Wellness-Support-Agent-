import { detectCrisis, generateCrisisResponse } from "./safetyService";
import { memoryService } from "./memoryService";
import { ChatGroq } from "@langchain/groq";
import { config } from "../config/env";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const model = new ChatGroq({
  apiKey: config.groqApiKey,
  model: "llama-3.3-70b-versatile", // High-performance Llama 3.3 model on Groq
});

/**
 * Main agent handler that uses real LangChain integration:
 * 1. Safety check
 * 2. Fetch context (RAG)
 * 3. LLM response generation
 */
export async function agenticReply(userId: string, message: string): Promise<string> {
  // 1. Safety verification
  if (detectCrisis(message)) {
    return generateCrisisResponse();
  }

  // 2. Add to vector memory
  await memoryService.storeInteraction(userId, message, "user");

  // 3. Fetch past contexts
  const contexts = await memoryService.fetchRelevantContext(userId, message);
  const contextString = contexts.length > 0 ? contexts.join("\n---\n") : "No previous relevant context.";

  // 4. Real Claude generation
  try {
    if (!config.anthropicApiKey) {
      throw new Error("Anthropic API key missing");
    }

    const response = await model.invoke([
      new SystemMessage(`You are MindCare AI, a supportive and empathetic mental wellness assistant. 
      Use the following context from previous interactions to personalize your response:
      ${contextString}`),
      new HumanMessage(message),
    ]);

    const reply = response.content.toString();

    // Store response back
    await memoryService.storeInteraction(userId, reply, "agent");

    return reply;
  } catch (error) {
    console.error("[AI Service] Error calling Anthropic:", error);
    return "I'm having a bit of trouble connecting right now, but I'm still here for you. How else can I support you today?";
  }
}
