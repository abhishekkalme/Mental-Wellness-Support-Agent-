import { NextResponse } from 'next/server';
import type { ChatMessage } from '@/lib/types';
import { agenticReply } from '@/ai/aiService';
import { chatRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeAndTrim } from '@/lib/utils';
import { auth } from '@/auth';
import { llmResponseCache } from '@/lib/cache';

type IncomingMsg = { id: string; role: 'user' | 'agent'; content: string; timestamp?: string };

export async function POST(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, remaining, resetIn } = await chatRateLimit(ip);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait.', retryAfter: resetIn },
      { status: 429, headers: { 'Retry-After': String(resetIn), 'X-RateLimit-Remaining': '0' } }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawMessages = body.messages as IncomingMsg[] | undefined;
    const userId = session.user.id;

    if (!rawMessages?.length) {
      return NextResponse.json({ error: 'No messages' }, { status: 400 });
    }

    const lastUserMessage = rawMessages[rawMessages.length - 1];
    const sanitized = sanitizeAndTrim(lastUserMessage.content);

    if (!sanitized) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    if (!llmResponseCache.tryAcquireDedup(userId, sanitized)) {
      return NextResponse.json({
        risk: 'none' as const,
        reply: 'Please wait a moment before sending another message.',
        languageId: 'en',
        remaining,
        dedup: true,
      });
    }

    const history: ChatMessage[] = rawMessages.slice(-10).map((m) => ({
      id: m.id,
      role: m.role,
      content: sanitizeAndTrim(m.content),
      timestamp: m.timestamp ?? new Date().toISOString(),
    }));

    const reply = await agenticReply(userId, sanitized, history);

    return NextResponse.json({
      risk: 'none' as const,
      reply,
      languageId: 'en',
      remaining,
    });
  } catch (error) {
    console.error('[api/chat]', error);
    return NextResponse.json(
      {
        risk: 'none' as const,
        reply: "I'm having trouble reaching the AI service right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}
