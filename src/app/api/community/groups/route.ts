import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityGroup from '@/lib/db/models/CommunityGroup';
import { auth } from '@/auth';
import { z } from 'zod';

const GroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  members: z.string().min(1, 'Members is required'),
  active: z.string().min(1, 'Active is required'),
  category: z.string().min(1, 'Category is required'),
  icon: z.string().min(1, 'Icon is required'),
  joined: z.boolean().optional(),
});

const BulkGroupSchema = z.array(GroupSchema);

export async function GET() {
  try {
    await connectDB();
    const groups = await CommunityGroup.find({});
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    await connectDB();
    const data = await req.json();
    const { _id, ...update } = data;
    if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });

    const parsed = GroupSchema.partial().safeParse(update);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const updated = await CommunityGroup.findByIdAndUpdate(_id, parsed.data, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get('_id');
    if (_id) {
      await CommunityGroup.findByIdAndDelete(_id);
    } else {
      await CommunityGroup.deleteMany({});
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
  try {
    await connectDB();
    const data = await req.json();

    if (Array.isArray(data)) {
      const parsed = BulkGroupSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const groups = await CommunityGroup.insertMany(parsed.data);
      return NextResponse.json(groups);
    } else {
      const parsed = GroupSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const group = await CommunityGroup.create(parsed.data);
      return NextResponse.json(group);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
