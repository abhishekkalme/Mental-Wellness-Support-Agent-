import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicCalendarEvent from '@/lib/db/models/AcademicCalendarEvent';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { startOfDay, endOfDay, isSameDay, parseISO } from 'date-fns';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');

    await connectDB();

    const baseQuery: Record<string, unknown> = {
      userId: session.user.id,
      status: { $ne: 'cancelled' },
      allDay: false,
    };

    if (dateParam) {
      const date = parseISO(dateParam);
      baseQuery.startDate = {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      };
    }

    const events = await AcademicCalendarEvent.find(baseQuery)
      .sort({ startDate: 1, startTime: 1 })
      .lean();

    const conflicts: {
      event1: Record<string, unknown>;
      event2: Record<string, unknown>;
      type: 'time-overlap' | 'same-day-exam' | 'back-to-back';
      description: string;
    }[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const a = events[i] as any;
        const b = events[j] as any;

        if (!isSameDay(new Date(a.startDate), new Date(b.startDate))) continue;
        if (!a.startTime || !b.startTime) continue;

        const aEnd = a.endTime || a.startTime;
        const bEnd = b.endTime || b.startTime;

        if (a.startTime < bEnd && b.startTime < aEnd) {
          conflicts.push({
            event1: {
              _id: a._id,
              title: a.title,
              eventType: a.eventType,
              startDate: a.startDate,
              startTime: a.startTime,
            },
            event2: {
              _id: b._id,
              title: b.title,
              eventType: b.eventType,
              startDate: b.startDate,
              startTime: b.startTime,
            },
            type: 'time-overlap',
            description: `"${a.title}" overlaps with "${b.title}"`,
          });
        }
      }
    }

    const examEvents = events.filter((e: any) => e.eventType === 'exam');
    for (let i = 0; i < examEvents.length; i++) {
      for (let j = i + 1; j < examEvents.length; j++) {
        const a = examEvents[i] as any;
        const b = examEvents[j] as any;
        if (isSameDay(new Date(a.startDate), new Date(b.startDate))) {
          conflicts.push({
            event1: {
              _id: a._id,
              title: a.title,
              eventType: a.eventType,
              startDate: a.startDate,
              startTime: a.startTime,
            },
            event2: {
              _id: b._id,
              title: b.title,
              eventType: b.eventType,
              startDate: b.startDate,
              startTime: b.startTime,
            },
            type: 'same-day-exam',
            description: `Two exams on the same day: "${a.title}" and "${b.title}"`,
          });
        }
      }
    }

    return NextResponse.json({ conflicts, total: conflicts.length });
  } catch (error) {
    console.error('[Conflicts] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
