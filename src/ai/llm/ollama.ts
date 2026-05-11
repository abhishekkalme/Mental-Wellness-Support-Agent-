import { ChatMessage } from '@/lib/types';

export type OllamaChatParams = {
  baseUrl?: string; // e.g. http://localhost:11434
  model: string; // e.g. llama3.1:8b
  system: string;
  messages: ChatMessage[];
};

export async function ollamaChat(params: OllamaChatParams): Promise<string> {
  const { baseUrl, model, system, messages } = params;
  const url = `${baseUrl ?? 'http://localhost:11434'}/api/chat`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: system },
        ...messages.map((m) => ({
          role: m.role === 'agent' ? 'assistant' : m.role,
          content: m.content,
        })),
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Ollama error (${res.status}): ${txt || res.statusText}`);
  }

  const json = (await res.json().catch(() => null)) as any;
  const text = json?.message?.content ?? '';
  if (!text) throw new Error('Empty model response');
  return String(text).trim();
}
