import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicCalendarEvent from '@/lib/db/models/AcademicCalendarEvent';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { z } from 'zod';

const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
});

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  updates: z.record(z.string(), z.unknown()),
});

export async function DELETE(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success)
    return NextResponse.json(
      { error: 'Rate limited' },
      {
        status: 429,
        headers: { 'Retry-After': String(resetIn) },
      }
    );

  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = bulkDeleteSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );

    await connectDB();

    const result = await AcademicCalendarEvent.deleteMany({
      _id: { $in: parsed.data.ids },
      userId: session.user.id,
    });

    return NextResponse.json({ deleted: result.deletedCount });
  } catch (error) {
    console.error('[AcademicCalendar] Bulk DELETE error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const ip = getClientIdentifier(req);
  const { success, resetIn } = await dataRateLimit(ip);
  if (!success)
    return NextResponse.json(
      { error: 'Rate limited' },
      {
        status: 429,
        headers: { 'Retry-After': String(resetIn) },
      }
    );

  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = bulkUpdateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );

    await connectDB();

    const result = await AcademicCalendarEvent.updateMany(
      { _id: { $in: parsed.data.ids }, userId: session.user.id },
      { $set: parsed.data.updates }
    );

    return NextResponse.json({ modified: result.modifiedCount });
  } catch (error) {
    console.error('[AcademicCalendar] Bulk PATCH error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
