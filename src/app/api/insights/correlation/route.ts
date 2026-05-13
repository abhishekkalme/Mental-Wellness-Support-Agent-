import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { callLlm } from '@/ai/llm';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      moodHistory = [],
      sleepHistory = [],
      journalEntries = [],
      habits = [],
      breathingHistory = [],
    } = body;

    const moodSummary = summarizeMood(moodHistory);
    const sleepSummary = summarizeSleep(sleepHistory);
    const journalSummary = summarizeJournal(journalEntries);
    const habitSummary = summarizeHabits(habits);
    const breathingSummary = summarizeBreathing(breathingHistory);

    if (
      moodHistory.length === 0 &&
      sleepHistory.length === 0 &&
      journalEntries.length === 0 &&
      habits.length === 0 &&
      breathingHistory.length === 0
    ) {
      return NextResponse.json({ insight: null });
    }

    const system = `You are a thoughtful wellness analyst. Based on a user's tracked data, generate one concise, personalized insight (2-4 sentences) that is warm, actionable, and specific. Speak in English. Do not mention "AI" or "analysis" — speak naturally like a caring wellness coach.`;

    const user = `Here is the user's recent wellness data:

MOOD (last ${moodHistory.length} entries): ${moodSummary}
SLEEP (last ${sleepHistory.length} entries): ${sleepSummary}
JOURNALING (last ${journalEntries.length} entries): ${journalSummary}
HABITS (${habits.length} active): ${habitSummary}
BREATHING (last ${breathingHistory.length} sessions): ${breathingSummary}

Generate one personalized insight about their wellness patterns. Focus on the most interesting correlation or observation. Keep it encouraging and specific.`;

    const reply = await callLlm({
      system,
      messages: [{ id: '1', role: 'user', content: user, timestamp: new Date().toISOString() }],
      maxOutputTokens: 200,
    });

    return NextResponse.json({ insight: reply });
  } catch (err) {
    console.error('[api/insights/correlation]', err);
    return NextResponse.json({ insight: null, error: 'Generation failed' }, { status: 503 });
  }
}

function summarizeMood(entries: any[]): string {
  if (!entries.length) return 'No mood entries recorded yet.';
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.mood] = (counts[e.mood] || 0) + 1;
  const entries_sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return entries_sorted.map(([mood, count]) => `${count} ${mood} days`).join(', ');
}

function summarizeSleep(entries: any[]): string {
  if (!entries.length) return 'No sleep entries.';
  const recent = entries.slice(-7);
  const avgDur = recent.reduce((s, e) => s + (e.durationHours || 0), 0) / recent.length;
  const avgQual = recent.reduce((s, e) => s + (e.quality || 3), 0) / recent.length;
  return `Avg ${avgDur.toFixed(1)}h/night, quality ${avgQual.toFixed(1)}/5 (last 7 entries)`;
}

function summarizeJournal(entries: any[]): string {
  if (!entries.length) return 'No journal entries.';
  const recent = entries.slice(-7);
  const totalWords = recent.reduce((s, e) => s + (e.content || '').split(' ').length, 0);
  const avgLen = recent.length ? Math.round(totalWords / recent.length) : 0;
  return `${recent.length} entries this week, avg ${avgLen} words/entry.`;
}

function summarizeHabits(habits: any[]): string {
  if (!habits.length) return 'No habits set.';
  const completedCount = habits.reduce((s, h) => s + (h.completedDates || []).length, 0);
  const streaks = habits.filter((h) => h.streak > 0).map((h) => `${h.name} (${h.streak}d streak)`);
  return `${habits.length} active habits, ${completedCount} total completions. ${streaks.join(', ') || 'No active streaks.'}`;
}

function summarizeBreathing(entries: any[]): string {
  if (!entries.length) return 'No breathing sessions.';
  const recent = entries.slice(-7);
  const totalMin = recent.reduce((s, e) => s + (e.durationSeconds || 0), 0) / 60;
  const patterns = [...new Set(recent.map((e) => e.pattern))];
  return `${recent.length} sessions this week (${totalMin.toFixed(0)}min total). Patterns: ${patterns.join(', ') || 'various'}.`;
}
