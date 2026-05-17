import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicCalendarEvent from '@/lib/db/models/AcademicCalendarEvent';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIdentifier(_req);
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

    const { id } = await params;

    await connectDB();

    const event = await AcademicCalendarEvent.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    return NextResponse.json(event);
  } catch (error) {
    console.error('[AcademicCalendar] GET by id error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
