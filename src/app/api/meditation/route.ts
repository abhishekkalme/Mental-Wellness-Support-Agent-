import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Meditation from '@/lib/db/models/Meditation';
import { auth } from '@/auth';
import { z } from 'zod';

const MeditationSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().min(1, 'Title is required'),
  duration: z.string().min(1, 'Duration is required'),
  category: z.string().min(1, 'Category is required'),
  img: z.string().min(1, 'Image is required'),
  desc: z.string().min(1, 'Description is required'),
});

const BulkMeditationSchema = z.array(MeditationSchema);

export async function GET() {
  try {
    await connectDB();
    const meditations = await Meditation.find({});
    return NextResponse.json(meditations);
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    await connectDB();

    if (Array.isArray(data)) {
      const parsed = BulkMeditationSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const newMeditations = await Meditation.insertMany(parsed.data);
      return NextResponse.json(newMeditations);
    } else {
      const parsed = MeditationSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const newMeditation = await Meditation.create(parsed.data);
      return NextResponse.json(newMeditation);
    }
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
