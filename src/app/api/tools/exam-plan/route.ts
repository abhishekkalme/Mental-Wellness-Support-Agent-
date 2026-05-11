import { NextResponse } from 'next/server';
import { callLlm } from '@/ai/llm';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';

type Req = {
  startDate?: string;
  subjects?: string[];
  hoursPerDay?: number;
  sleepWindow?: string;
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
  const subjects = body?.subjects?.filter(Boolean) ?? [];

  const system = [
    'You are an expert student study coach.',
    'Return a practical 7-day micro-plan for exam week.',
    'Constraints:',
    '- Keep it realistic and short.',
    '- Include: sleep window, 2-4 revision chunks/day, and a panic protocol (2 minutes).',
    '- Use Hinglish if user inputs are Hinglish.',
  ].join('\n');

  const user = [
    `Exam start date: ${body?.startDate ?? 'unknown'}`,
    `Subjects: ${subjects.join(', ') || 'unknown'}`,
    `Hours/day available: ${body?.hoursPerDay ?? 'unknown'}`,
    `Preferred sleep window: ${body?.sleepWindow ?? 'unknown'}`,
  ].join('\n');

  const plan = await callLlm({
    system,
    messages: [
      {
        id: 'system-1',
        role: 'user',
        content: user,
        timestamp: new Date().toISOString(),
      },
    ],
    maxOutputTokens: 550,
  });

  return NextResponse.json({ plan });
}
