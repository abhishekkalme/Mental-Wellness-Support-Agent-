import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SleepWellbeing from '@/lib/db/models/SleepWellbeing';
import { z } from 'zod';
import { auth } from '@/auth';

const WellbeingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  iconName: z.string().optional(),
});

const BulkWellbeingSchema = z.array(WellbeingSchema);

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
    const wellbeing = await SleepWellbeing.find({});
    return NextResponse.json(wellbeing);
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

    const parsed = WellbeingSchema.partial().safeParse(update);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const updated = await SleepWellbeing.findByIdAndUpdate(_id, parsed.data, { new: true });
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
      await SleepWellbeing.findByIdAndDelete(_id);
    } else {
      await SleepWellbeing.deleteMany({});
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
      const parsed = BulkWellbeingSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const wellbeing = await SleepWellbeing.insertMany(parsed.data);
      return NextResponse.json(wellbeing);
    } else {
      const parsed = WellbeingSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const entry = await SleepWellbeing.create(parsed.data);
      return NextResponse.json(entry);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
