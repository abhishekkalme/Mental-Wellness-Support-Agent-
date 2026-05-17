import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicCalendarEvent from '@/lib/db/models/AcademicCalendarEvent';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { createEventSchema } from '@/schemas/academic-calendar';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function parseICSDate(icsDate: string): string {
  const match = icsDate.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return icsDate;
  return `${match[1]}-${match[2]}-${match[3]}`;
}

const VALID_TYPES = [
  'exam',
  'deadline',
  'lecture',
  'holiday',
  'assignment',
  'internal-assessment',
  'registration',
  'fee-deadline',
  'result',
  'faculty-event',
  'department-event',
  'office-hours',
  'study-group',
  'personal',
];

function inferEventType(title: string): string {
  const lower = title.toLowerCase();
  if (
    lower.includes('exam') ||
    lower.includes('test') ||
    lower.includes('midterm') ||
    lower.includes('final')
  )
    return 'exam';
  if (lower.includes('deadline') || lower.includes('due') || lower.includes('submit'))
    return 'deadline';
  if (lower.includes('assignment') || lower.includes('homework') || lower.includes('problem set'))
    return 'assignment';
  if (lower.includes('lecture') || lower.includes('class') || lower.includes('tutorial'))
    return 'lecture';
  if (lower.includes('holiday') || lower.includes('break') || lower.includes('vacation'))
    return 'holiday';
  if (lower.includes('assessment') || lower.includes('quiz')) return 'internal-assessment';
  if (lower.includes('registration') || lower.includes('enroll')) return 'registration';
  if (lower.includes('fee') || lower.includes('payment') || lower.includes('pay'))
    return 'fee-deadline';
  if (lower.includes('result') || lower.includes('grade') || lower.includes('transcript'))
    return 'result';
  return 'personal';
}

export async function POST(req: Request) {
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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const format = (formData.get('format') as string) || 'csv';

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim());

    const rawRows: { row: number; data: Record<string, unknown> }[] = [];
    const errors: { row: number; error: string }[] = [];

    if (format === 'csv') {
      const headerLine = lines[0].toLowerCase();
      const headers = parseCSVLine(headerLine);
      const titleIdx = headers.findIndex((h) =>
        ['title', 'subject', 'name', 'summary'].includes(h)
      );
      const dateIdx = headers.findIndex((h) =>
        ['date', 'start date', 'startdate', 'day', 'dtstart'].includes(h)
      );
      const endDateIdx = headers.findIndex((h) => ['end date', 'enddate', 'dtend'].includes(h));
      const timeIdx = headers.findIndex((h) => ['time', 'start time', 'starttime'].includes(h));
      const typeIdx = headers.findIndex((h) => ['type', 'category', 'event type'].includes(h));
      const courseIdx = headers.findIndex((h) => ['course', 'class', 'subject'].includes(h));
      const locationIdx = headers.findIndex((h) => ['location', 'place', 'room'].includes(h));
      const descIdx = headers.findIndex((h) => ['description', 'desc', 'notes'].includes(h));

      if (titleIdx === -1 || dateIdx === -1) {
        return NextResponse.json(
          { error: 'CSV must have at least "title" and "date" columns' },
          { status: 400 }
        );
      }

      for (let i = 1; i < lines.length; i++) {
        try {
          const cols = parseCSVLine(lines[i]);
          const title = cols[titleIdx]?.trim() || '';
          const dateStr = cols[dateIdx]?.trim() || '';
          if (!title || !dateStr) {
            errors.push({ row: i + 1, error: 'Missing title or date' });
            continue;
          }

          const rawType = cols[typeIdx]?.trim().toLowerCase();
          const eventType =
            rawType && VALID_TYPES.includes(rawType) ? rawType : inferEventType(title);

          rawRows.push({
            row: i + 1,
            data: {
              title: title.replace(/[<>]/g, '').slice(0, 300),
              eventType,
              startDate: dateStr,
              endDate: endDateIdx >= 0 ? cols[endDateIdx]?.trim() : undefined,
              allDay: !timeIdx || !cols[timeIdx]?.trim(),
              startTime: timeIdx >= 0 ? cols[timeIdx]?.trim() : undefined,
              course: courseIdx >= 0 ? cols[courseIdx]?.trim() : undefined,
              location: locationIdx >= 0 ? cols[locationIdx]?.trim() : undefined,
              description: descIdx >= 0 ? cols[descIdx]?.trim() : undefined,
            },
          });
        } catch {
          errors.push({ row: i + 1, error: 'Failed to parse row' });
        }
      }
    } else if (format === 'ics') {
      let currentEvent: Record<string, string> | null = null;
      let inEvent = false;

      for (const line of lines) {
        if (line === 'BEGIN:VEVENT') {
          inEvent = true;
          currentEvent = {};
          continue;
        }
        if (line === 'END:VEVENT' && currentEvent) {
          const title = (currentEvent.SUMMARY || '').replace(/[<>]/g, '').slice(0, 300);
          const dtstart = currentEvent.DTSTART || '';
          const dtend = currentEvent.DTEND || '';
          const dateStr = dtstart ? parseICSDate(dtstart) : '';

          if (title && dateStr) {
            rawRows.push({
              row: rawRows.length + 1,
              data: {
                title,
                eventType: inferEventType(title),
                startDate: dateStr,
                endDate: dtend ? parseICSDate(dtend) : undefined,
                allDay: !dtstart.includes('T'),
                startTime: dtstart.includes('T')
                  ? `${dtstart.slice(9, 11)}:${dtstart.slice(11, 13)}`
                  : undefined,
                location: currentEvent.LOCATION || undefined,
                description: currentEvent.DESCRIPTION || undefined,
              },
            });
          }
          inEvent = false;
          currentEvent = null;
          continue;
        }
        if (inEvent && currentEvent && line.includes(':')) {
          const colonIdx = line.indexOf(':');
          const key = line.slice(0, colonIdx).trim();
          const value = line.slice(colonIdx + 1).trim();
          if (key === 'DTSTART' || key.startsWith('DTSTART;')) {
            currentEvent.DTSTART = line.split(':').slice(1).join(':');
          } else if (key === 'DTEND' || key.startsWith('DTEND;')) {
            currentEvent.DTEND = line.split(':').slice(1).join(':');
          } else {
            currentEvent[key] = value;
          }
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use "csv" or "ics".' },
        { status: 400 }
      );
    }

    const valid: Record<string, unknown>[] = [];

    for (const { row, data } of rawRows) {
      const parsed = createEventSchema.safeParse(data);
      if (!parsed.success) {
        const msgs = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        errors.push({ row, error: msgs });
        continue;
      }

      valid.push({
        userId: session.user.id,
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined,
        recurrenceEndDate: parsed.data.recurrenceEndDate
          ? new Date(parsed.data.recurrenceEndDate)
          : undefined,
      });
    }

    await connectDB();

    if (valid.length > 0) {
      try {
        await AcademicCalendarEvent.insertMany(valid, { ordered: false });
      } catch (dbError: any) {
        if (dbError?.writeErrors) {
          for (const we of dbError.writeErrors) {
            errors.push({ row: we.index + 1, error: `Database error: ${we.errmsg}` });
          }
        } else {
          throw dbError;
        }
      }
    }

    return NextResponse.json({
      success: true,
      total: valid.length + errors.length,
      imported: valid.length,
      errors,
    });
  } catch (error) {
    console.error('[Import] POST error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
