import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SleepMusic from '@/lib/db/models/SleepMusic';
import { z } from 'zod';
import { auth } from '@/auth';

const MusicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  bpm: z.string().min(1, 'BPM is required'),
  audioUrl: z.string().optional(),
});

const BulkMusicSchema = z.array(MusicSchema);

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;
  try {
    await connectDB();
    const music = await SleepMusic.find({});
    return NextResponse.json(music);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const authError = await requireAuth();
  if (authError) return authError;
  try {
    await connectDB();
    const data = await req.json();
    const { _id, ...update } = data;
    if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });

    const parsed = MusicSchema.partial().safeParse(update);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const updated = await SleepMusic.findByIdAndUpdate(_id, parsed.data, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const authError = await requireAuth();
  if (authError) return authError;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get('_id');
    if (_id) {
      await SleepMusic.findByIdAndDelete(_id);
    } else {
      await SleepMusic.deleteMany({});
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const authError = await requireAuth();
  if (authError) return authError;
  try {
    await connectDB();
    const data = await req.json();

    if (Array.isArray(data)) {
      const parsed = BulkMusicSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const music = await SleepMusic.insertMany(parsed.data);
      return NextResponse.json(music);
    } else {
      const parsed = MusicSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const track = await SleepMusic.create(parsed.data);
      return NextResponse.json(track);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
