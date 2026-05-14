import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { readSettings } from '@/lib/settings';
import { z } from 'zod';

const AISettingsSchema = z.object({
  provider: z.enum(['groq', 'gemini', 'openrouter', 'ollama']).optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const settings = await readSettings();
    return NextResponse.json({
      provider: settings.provider,
      model: settings.model,
      apiKey: settings.apiKey ? `***${settings.apiKey.slice(-4)}` : '',
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[admin/settings/ai]', e);
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = AISettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const current = await readSettings();
    const updated = {
      ...current,
      ...parsed.data,
    };

    return NextResponse.json({
      provider: updated.provider,
      model: updated.model,
      apiKey: updated.apiKey ? `***${updated.apiKey.slice(-4)}` : '',
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[admin/settings/ai]', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
