import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SleepStory from '@/lib/db/models/SleepStory';
import { z } from 'zod';
import { auth } from '@/auth';

const StorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  duration: z.string().min(1, 'Duration is required'),
  narrator: z.string().min(1, 'Narrator is required'),
  category: z.string().min(1, 'Category is required'),
  img: z.string().min(1, 'Image is required'),
});

const BulkStorySchema = z.array(StorySchema);

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
    const stories = await SleepStory.find({});
    return NextResponse.json(stories);
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
      const parsed = BulkStorySchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const stories = await SleepStory.insertMany(parsed.data);
      return NextResponse.json(stories);
    } else {
      const parsed = StorySchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const story = await SleepStory.create(parsed.data);
      return NextResponse.json(story);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
