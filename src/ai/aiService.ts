import { detectCrisis, generateCrisisResponse } from './safetyService';
import { memoryService } from './memoryService';
import { callLlm } from '@/ai/llm';
import { buildMultilingualSystemPrompt, getLanguageById } from '@/lib/chat/indianLanguages';
import type { ChatMessage } from '@/lib/types';

type UserContext = {
  name?: string;
  feeling?: string;
  priorities?: string;
  aiStyle?: string;
  language?: string;
  metrics?: Record<string, number> | null;
} | null;

export async function agenticReply(
  userId: string,
  message: string,
  history: ChatMessage[] = [],
  userContext: UserContext = null
): Promise<string> {
  if (detectCrisis(message)) {
    return generateCrisisResponse();
  }

  const contexts = await memoryService.fetchRelevantContext(userId, message);
  const contextParts: string[] = [];

  if (contexts.length > 0) {
    contextParts.push(
      `Previous conversation context:\n${contexts.map((c) => `• ${c}`).join('\n')}`
    );
  }

  if (userContext) {
    const profileParts: string[] = [];
    if (userContext.name) profileParts.push(`User's name: ${userContext.name}`);
    if (userContext.feeling) profileParts.push(`Current emotional state: ${userContext.feeling}`);
    if (userContext.priorities) profileParts.push(`Wellness priorities: ${userContext.priorities}`);
    if (userContext.aiStyle) profileParts.push(`Preferred AI style: ${userContext.aiStyle}`);
    if (userContext.metrics) {
      const m = userContext.metrics;
      profileParts.push(
        `Wellness metrics (1-100): Mental=${m.mental ?? '?'}, Emotional=${m.emotional ?? '?'}, Physical=${m.physical ?? '?'}, Sleep=${m.sleep ?? '?'}, Social=${m.social ?? '?'}, Spiritual=${m.spiritual ?? '?'}`
      );
    }
    if (profileParts.length) {
      contextParts.push(`User profile from onboarding:\n${profileParts.join('\n')}`);
    }
  }

  const contextString = contextParts.join('\n');

  const lang = getLanguageById(userContext?.language || 'en');
  const system = buildMultilingualSystemPrompt(lang, {
    safeMode: false,
    liteMode: false,
    firstGen: false,
    context: contextString,
  });

  const reply = await callLlm({
    system,
    messages: history.slice(-10),
    maxOutputTokens: 512,
    userId,
  });

  memoryService.storeInteraction(userId, message, 'user').catch(() => {});
  memoryService.storeInteraction(userId, reply, 'agent').catch(() => {});

  return reply;
}
