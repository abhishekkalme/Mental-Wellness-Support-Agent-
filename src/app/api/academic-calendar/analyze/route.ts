import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicCalendarEvent from '@/lib/db/models/AcademicCalendarEvent';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { addDays, startOfWeek, endOfWeek, differenceInDays, parseISO } from 'date-fns';

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
    const weeksAhead = Math.min(12, Math.max(1, parseInt(searchParams.get('weeks') || '4', 10)));

    await connectDB();

    const now = new Date();
    const startDate = startOfWeek(now, { weekStartsOn: 0 });
    const endDate = endOfWeek(addDays(now, weeksAhead * 7), { weekStartsOn: 0 });

    const events = await AcademicCalendarEvent.find({
      userId: session.user.id,
      status: { $ne: 'cancelled' },
      startDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ startDate: 1 })
      .lean();

    const weeks: {
      weekStart: string;
      weekEnd: string;
      label: string;
      total: number;
      exams: number;
      deadlines: number;
      lectures: number;
      highPriority: number;
      density: 'low' | 'medium' | 'high' | 'critical';
    }[] = [];

    const totalDays = differenceInDays(endDate, startDate) + 1;
    const dayBuckets = new Map<string, number>();
    const dayExamBuckets = new Map<string, number>();
    const dayDeadlineBuckets = new Map<string, number>();

    for (const event of events) {
      const day = (event as any).startDate as Date;
      const key = day.toISOString().split('T')[0];
      dayBuckets.set(key, (dayBuckets.get(key) || 0) + 1);
      if ((event as any).eventType === 'exam')
        dayExamBuckets.set(key, (dayExamBuckets.get(key) || 0) + 1);
      if ((event as any).eventType === 'deadline' || (event as any).eventType === 'assignment')
        dayDeadlineBuckets.set(key, (dayDeadlineBuckets.get(key) || 0) + 1);
    }

    for (let w = 0; w < weeksAhead; w++) {
      const ws = addDays(startDate, w * 7);
      const we = addDays(ws, 6);
      const label = w === 0 ? 'This Week' : w === 1 ? 'Next Week' : `Week ${w + 1}`;

      const weekEvents = events.filter((e) => {
        const d = new Date((e as any).startDate);
        return d >= ws && d <= we;
      });

      const total = weekEvents.length;
      const exams = weekEvents.filter((e) => (e as any).eventType === 'exam').length;
      const deadlines = weekEvents.filter(
        (e) => (e as any).eventType === 'deadline' || (e as any).eventType === 'assignment'
      ).length;
      const lectures = weekEvents.filter((e) => (e as any).eventType === 'lecture').length;
      const highPriority = weekEvents.filter(
        (e) => (e as any).priority === 'high' || (e as any).priority === 'critical'
      ).length;

      let density: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (total >= 10 || (exams >= 2 && highPriority >= 2)) density = 'critical';
      else if (total >= 6 || exams >= 1 || highPriority >= 2) density = 'high';
      else if (total >= 3) density = 'medium';

      weeks.push({
        weekStart: ws.toISOString(),
        weekEnd: we.toISOString(),
        label,
        total,
        exams,
        deadlines,
        lectures,
        highPriority,
        density,
      });
    }

    const maxPerDay = Math.max(...Array.from(dayBuckets.values()), 0);
    const busiestDay =
      maxPerDay > 0
        ? Array.from(dayBuckets.entries()).find(([, c]) => c === maxPerDay)?.[0] || null
        : null;

    const upcomingExamDays = Array.from(dayExamBuckets.entries())
      .filter(([, c]) => c > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 5)
      .map(([date, count]) => ({ date, count }));

    const upcomingDeadlineDays = Array.from(dayDeadlineBuckets.entries())
      .filter(([, c]) => c > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 5)
      .map(([date, count]) => ({ date, count }));

    const criticalWeeks = weeks.filter((w) => w.density === 'critical' || w.density === 'high');
    const hasOverload = criticalWeeks.length > 0;

    let recommendation = '';
    if (hasOverload) {
      const worst = criticalWeeks[0];
      recommendation = `High workload detected in ${worst.label}. Consider spreading deadlines across multiple weeks.`;
    } else {
      const totalEvents = events.length;
      if (totalEvents === 0)
        recommendation = 'No events in the next month. Great time to plan ahead!';
      else recommendation = 'Workload looks manageable. Stay consistent with your schedule.';
    }

    return NextResponse.json({
      weeks,
      summary: {
        totalEvents: events.length,
        busiestDay,
        maxEventsPerDay: maxPerDay,
        upcomingExamDays,
        upcomingDeadlineDays,
        criticalWeeks: criticalWeeks.length,
        hasOverload,
        recommendation,
      },
    });
  } catch (error) {
    console.error('[Analyze] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
