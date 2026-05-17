import { callLlm } from '@/ai/llm';
import { detectCrisis } from '@/ai/safetyService';
import type { ChatMessage } from '@/lib/types';

interface SessionNoteData {
  content: string;
  goals: string[];
  moodBefore?: number;
  moodAfter?: number;
  progress?: string;
}

export async function generateSessionSummary(note: SessionNoteData): Promise<string> {
  const prompt = `You are a clinical note assistant. Summarize the following therapy session notes into a concise SOAP-style summary.

Session Notes:
${note.content}

Goals: ${note.goals.join(', ')}
Mood Before: ${note.moodBefore || 'N/A'}/10
Mood After: ${note.moodAfter || 'N/A'}/10
Progress: ${note.progress || 'N/A'}

Generate a brief SOAP summary (Subjective, Objective, Assessment, Plan) based on these notes. Keep it professional and concise.`;

  const messages: ChatMessage[] = [
    { id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() },
  ];

  try {
    return await callLlm({
      system: 'You are a professional clinical note assistant.',
      messages,
      maxOutputTokens: 512,
    });
  } catch {
    return note.content;
  }
}

export async function detectSessionRisk(
  text: string
): Promise<{ hasRisk: boolean; flags: string[] }> {
  const flags: string[] = [];

  if (detectCrisis(text)) {
    flags.push('crisis-language');
  }

  const riskPatterns = [
    { pattern: /\b(isolation|alone|lonely)\b/i, flag: 'social-isolation' },
    { pattern: /\b(hopeless|worthless|nobody cares)\b/i, flag: 'hopelessness' },
    { pattern: /\b(anger|rage|violent|hurt someone)\b/i, flag: 'violence-risk' },
    { pattern: /\b(substance|alcohol|drug|addiction|relapse)\b/i, flag: 'substance-use' },
    { pattern: /\b(medication|prescription|dosage|withdrawal)\b/i, flag: 'medication-concern' },
  ];

  for (const { pattern, flag } of riskPatterns) {
    if (pattern.test(text) && !flags.includes(flag)) {
      flags.push(flag);
    }
  }

  return { hasRisk: flags.length > 0, flags };
}

export async function generateFollowUpSuggestions(
  note: SessionNoteData,
  previousOutcomes: string[]
): Promise<string[]> {
  const prompt = `Based on the following therapy session data, suggest 2-3 specific follow-up focus areas for the next session.

Session Notes: ${note.content.slice(0, 500)}
Goals: ${note.goals.join(', ')}
Progress: ${note.progress || 'N/A'}
Previous Session Outcomes: ${previousOutcomes.join('; ') || 'First session'}

Return only the suggested focus areas as a comma-separated list.`;

  const messages: ChatMessage[] = [
    { id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() },
  ];

  try {
    const response = await callLlm({
      system: 'You are a clinical supervisor.',
      messages,
      maxOutputTokens: 256,
    });
    return response
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  } catch {
    return ['Continue working on current goals'];
  }
}

export async function generateClientTrendInsights(
  sessionHistory: { date: string; moodBefore: number; moodAfter: number; goals: string[] }[]
): Promise<string> {
  if (sessionHistory.length < 2) return 'Not enough session data to identify trends.';

  const prompt = `Analyze the following therapy session history and provide 2-3 key insights about client progress:

${sessionHistory
  .map(
    (s, i) =>
      `Session ${i + 1} (${s.date}): Mood ${s.moodBefore} → ${s.moodAfter}, Goals: ${s.goals.join(', ')}`
  )
  .join('\n')}

Provide brief, actionable insights about trends, progress, and areas needing attention.`;

  const messages: ChatMessage[] = [
    { id: '1', role: 'user', content: prompt, timestamp: new Date().toISOString() },
  ];

  try {
    return await callLlm({
      system: 'You are a clinical data analyst.',
      messages,
      maxOutputTokens: 512,
    });
  } catch {
    return 'Unable to generate trend analysis at this time.';
  }
}
