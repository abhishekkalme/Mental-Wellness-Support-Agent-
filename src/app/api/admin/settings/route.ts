import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { z } from 'zod';

const SettingsSchema = z.object({
  provider: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});

let settingsState = {
  provider: 'gemini' as string,
  apiKey: '',
  model: '',
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(settingsState);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const parsed = SettingsSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    settingsState = { ...settingsState, ...parsed.data, updatedAt: new Date().toISOString() };
    return NextResponse.json(settingsState);
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
