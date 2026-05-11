import { ChatMessage } from '@/lib/types';

export type GroqChatParams = {
  apiKey: string;
  model: string; // e.g. "llama3-70b-8192" or "llama3-8b-8192"
  system: string;
  messages: ChatMessage[];
  maxOutputTokens?: number;
};

export async function groqChat(params: GroqChatParams): Promise<string> {
  const { apiKey, model, system, messages, maxOutputTokens } = params;
  if (!apiKey) throw new Error('Missing Groq API key');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system },
        ...messages.map((m) => ({
          role: m.role === 'agent' ? 'assistant' : m.role,
          content: m.content,
        })),
      ],
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: maxOutputTokens,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Groq error (${res.status}): ${txt || res.statusText}`);
  }
  const json = (await res.json().catch(() => null)) as any;
  const text = json?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Empty model response');
  return String(text).trim();
}
