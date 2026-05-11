import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicEvent from '@/lib/db/models/AcademicEvent';
import { auth } from '@/auth';
import { z } from 'zod';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';

const academicEventSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  date: z.string(),
  type: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  userId: z.string().optional(),
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
      AcademicEvent.find(query).sort({ date: 1 }).skip(skip).limit(limit),
      AcademicEvent.countDocuments(query),
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
    if (Array.isArray(data)) {
      const parsed = z.array(academicEventSchema).safeParse(data);
      if (!parsed.success) return new NextResponse('Invalid input', { status: 400 });
      await connectDB();
      const newEvents = await AcademicEvent.insertMany(
        parsed.data.map((e) => ({ ...e, userId: session.user.id }))
      );
      return NextResponse.json(newEvents);
    } else {
      const parsed = academicEventSchema.safeParse(data);
      if (!parsed.success) return new NextResponse('Invalid input', { status: 400 });
      await connectDB();
      const newEvent = await AcademicEvent.create({ ...parsed.data, userId: session.user.id });
      return NextResponse.json(newEvent);
    }
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
    const parsed = academicEventSchema.safeParse(data);
    if (!parsed.success) return new NextResponse('Invalid input', { status: 400 });
    await connectDB();
    const updated = await AcademicEvent.findOneAndUpdate(
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
    await AcademicEvent.deleteOne({ id, userId: session.user.id });
    return NextResponse.json({ success: true });
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
