import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import AcademicCalendarEvent from '@/lib/db/models/AcademicCalendarEvent';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { createEventSchema, updateEventSchema } from '@/schemas/academic-calendar';

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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const eventType = searchParams.get('eventType');
    const semesterId = searchParams.get('semesterId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const course = searchParams.get('course');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = { userId: session.user.id };

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) (query.startDate as Record<string, unknown>)['$gte'] = new Date(startDate);
      if (endDate) (query.startDate as Record<string, unknown>)['$lte'] = new Date(endDate);
    }

    if (eventType) query.eventType = eventType;
    if (semesterId) query.semesterId = semesterId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (course) query.course = { $regex: course, $options: 'i' };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    await connectDB();

    const [events, total] = await Promise.all([
      AcademicCalendarEvent.find(query)
        .sort({ startDate: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AcademicCalendarEvent.countDocuments(query),
    ]);

    return NextResponse.json({ data: events, page, limit, total });
  } catch (error) {
    console.error('[AcademicCalendar] GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
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

    const body = await req.json();

    const inputIsArray = Array.isArray(body);
    const raw = inputIsArray ? body : [body];

    const parsed = z.array(createEventSchema).safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const events = parsed.data.map((e) => ({
      ...e,
      userId: session.user.id,
      startDate: new Date(e.startDate),
      endDate: e.endDate ? new Date(e.endDate) : undefined,
      recurrenceEndDate: e.recurrenceEndDate ? new Date(e.recurrenceEndDate) : undefined,
      tags: e.tags || [],
      reminders: e.reminders || [],
    }));

    const created = await AcademicCalendarEvent.insertMany(events);

    return NextResponse.json(inputIsArray ? created : created[0], { status: 201 });
  } catch (error) {
    console.error('[AcademicCalendar] POST error:', error);
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
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

    const parsed = updateEventSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateFields: Record<string, unknown> = { ...parsed.data };
    if (updateFields.startDate) updateFields.startDate = new Date(updateFields.startDate as string);
    if (updateFields.endDate) updateFields.endDate = new Date(updateFields.endDate as string);
    if (updateFields.recurrenceEndDate)
      updateFields.recurrenceEndDate = new Date(updateFields.recurrenceEndDate as string);

    await connectDB();

    const updated = await AcademicCalendarEvent.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[AcademicCalendar] PATCH error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

    await connectDB();

    const result = await AcademicCalendarEvent.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AcademicCalendar] DELETE error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
