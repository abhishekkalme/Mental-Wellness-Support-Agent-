import { ChatMessage } from '@/lib/types';

export type GeminiChatParams = {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  maxOutputTokens?: number;
};

export async function geminiChat(params: GeminiChatParams): Promise<string> {
  const { apiKey, model, system, messages, maxOutputTokens } = params;
  if (!apiKey) throw new Error('Missing Gemini API key');

  // Gemini REST: generateContent
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    encodeURIComponent(model) +
    `:generateContent?key=` +
    encodeURIComponent(apiKey);

  const contents = [
    { role: 'user', parts: [{ text: system }] },
    ...messages.map((m) => ({
      role: m.role === 'agent' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: maxOutputTokens ?? 512,
        temperature: 0.6,
        topP: 0.9,
      },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Gemini error (${res.status}): ${txt || res.statusText}`);
  }

  const json = (await res.json().catch(() => null)) as any;
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join('') ?? '';
  if (!text) throw new Error('Empty model response');
  return String(text).trim();
}
