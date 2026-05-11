import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Habit from '@/lib/db/models/Habit';
import { auth } from '@/auth';
import { z } from 'zod';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeAndTrim } from '@/lib/utils';

const habitSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  frequency: z.enum(['daily', 'weekly']),
  streak: z.number().int().min(0).default(0),
  completedDates: z.array(z.string()).default([]),
});

export async function GET(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success)
    return new NextResponse('Rate limited', {
      status: 429,
      headers: { 'Retry-After': String(resetIn) },
    });
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;
    await connectDB();
    const query = { userId: session.user.id };
    const [entries, total] = await Promise.all([
      Habit.find(query).skip(skip).limit(limit),
      Habit.countDocuments(query),
    ]);
    return NextResponse.json({ data: entries, page, limit, total });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success)
    return new NextResponse('Rate limited', {
      status: 429,
      headers: { 'Retry-After': String(resetIn) },
    });
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    const data = await req.json();
    const parsed = habitSchema.safeParse(data);
    if (!parsed.success) return new NextResponse('Invalid input', { status: 400 });
    parsed.data.name = sanitizeAndTrim(parsed.data.name);
    await connectDB();
    const existing = await Habit.findOne({ id: parsed.data.id, userId: session.user.id });
    if (existing) {
      const updated = await Habit.findOneAndUpdate(
        { id: parsed.data.id, userId: session.user.id },
        { ...parsed.data, userId: session.user.id },
        { new: true }
      );
      return NextResponse.json(updated);
    }
    const newEntry = await Habit.create({ ...parsed.data, userId: session.user.id });
    return NextResponse.json(newEntry);
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success)
    return new NextResponse('Rate limited', {
      status: 429,
      headers: { 'Retry-After': String(resetIn) },
    });
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    const data = await req.json();
    const parsed = habitSchema.safeParse(data);
    if (!parsed.success) return new NextResponse('Invalid input', { status: 400 });
    parsed.data.name = sanitizeAndTrim(parsed.data.name);
    await connectDB();
    const updated = await Habit.findOneAndUpdate(
      { id: parsed.data.id, userId: session.user.id },
      { ...parsed.data, userId: session.user.id },
      { new: true }
    );
    if (!updated) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success)
    return new NextResponse('Rate limited', {
      status: 429,
      headers: { 'Retry-After': String(resetIn) },
    });
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });
    await connectDB();
    await Habit.deleteOne({ id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
