import { NextResponse } from 'next/server';
import type { ChatMessage } from '@/lib/types';
import { agenticReply } from '@/ai/aiService';
import { detectCrisis } from '@/ai/safetyService';
import { chatRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeAndTrim } from '@/lib/utils';
import { auth } from '@/auth';
import { llmResponseCache } from '@/lib/cache';
import { connectDB } from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

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

    const hasCrisis = detectCrisis(sanitized);
    if (hasCrisis) {
      return NextResponse.json({
        risk: 'crisis' as const,
        reply:
          "CRITICAL_SAFETY_TRIGGER: It sounds like you are going through a very difficult time. Please know you don't have to go through this alone. I am an AI, but immediate human support is available. Please reach out to the Crisis Lifeline by calling or texting 988, or text HOME to 741741 to connect with a crisis counselor 24/7. Your life is valuable.",
        languageId: 'en',
        remaining,
      });
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

    const userContext = await loadUserContext(userId);

    const reply = await agenticReply(userId, sanitized, history, userContext);

    return NextResponse.json({
      risk: 'none' as const,
      reply,
      languageId: 'en',
      remaining,
    });
  } catch (error) {
    console.error('[api/chat] Critical Failure:', error);
    if (error instanceof Error) {
      console.error('[api/chat] Error Stack:', error.stack);
    }
    return NextResponse.json(
      {
        risk: 'none' as const,
        reply: "I'm having trouble reaching the AI service right now. Please try again shortly.",
      },
      { status: 503 }
    );
  }
}

async function loadUserContext(userId: string) {
  try {
    await connectDB();
    const user = await User.findOne({ _id: userId }).select(
      'name onboardingData wellnessMetrics preferredLanguage'
    );
    if (!user) return null;

    const ctx = {
      name: user.name || '',
      feeling: user.onboardingData?.feeling || '',
      priorities: (user.onboardingData?.priorities || []).join(', '),
      aiStyle: user.onboardingData?.aiStyle || 'listen',
      language: user.preferredLanguage || 'en',
      metrics: user.wellnessMetrics || null,
    };

    return ctx;
  } catch {
    return null;
  }
}
