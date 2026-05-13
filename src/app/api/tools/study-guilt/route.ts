import { NextResponse } from 'next/server';
import { callLlm } from '@/ai/llm';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';

type Req = {
  answer?: string;
};

export async function POST(request: Request) {
  const ip = getClientIdentifier(request);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success) {
    return new NextResponse('Rate limited', {
      status: 429,
      headers: { 'Retry-After': String(resetIn) },
    });
  }

  const body = (await request.json().catch(() => null)) as Req | null;
  const userInput = body?.answer?.trim() ?? '';

  const system = [
    'You are a compassionate study guilt coach for students struggling with academic pressure.',
    'When a student shares how they are feeling about studying, respond with:',
    '1. A brief emotional acknowledgment (1 sentence)',
    '2. A classification of their state: anxious, tired, overwhelmed, distracted, or unmotivated',
    '3. 3 concrete, actionable steps they can do RIGHT NOW (each under 10 words)',
    'Format your response exactly as JSON with keys: "acknowledgment", "state", "steps" (array of 3 strings).',
    'Be warm, non-judgmental, and practical. Use simple language. Support Hinglish inputs.',
    'If the user has not shared anything specific, still respond helpfully.',
  ].join('\n');

  const response = await callLlm({
    system,
    messages: [
      {
        id: 'study-guilt-1',
        role: 'user',
        content: userInput || 'I am not feeling great about studying.',
        timestamp: new Date().toISOString(),
      },
    ],
    maxOutputTokens: 300,
  });

  let parsed = { state: 'unknown', steps: ['Start with a 5-minute task.', 'Take a short break.', 'Reach out to a friend.'], acknowledgment: 'It is okay to feel this way.' };
  try {
    const cleaned = response.replace(/```json\n?/gi, '').replace(/```\n?$/gi, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback to raw response if JSON parsing fails
    return NextResponse.json({ state: 'unknown', steps: [response], acknowledgment: 'It is okay to feel this way.' });
  }

  return NextResponse.json(parsed);
}
