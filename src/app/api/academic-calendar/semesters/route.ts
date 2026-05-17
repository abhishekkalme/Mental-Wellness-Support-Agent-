import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Semester from '@/lib/db/models/Semester';
import { auth } from '@/auth';
import { dataRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { createSemesterSchema, updateSemesterSchema } from '@/schemas/academic-calendar';

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
    const onlyActive = searchParams.get('active') === 'true';

    await connectDB();

    const query: Record<string, unknown> = { createdBy: session.user.id };
    if (onlyActive) query.isActive = true;

    const semesters = await Semester.find(query).sort({ startDate: -1 }).lean();

    return NextResponse.json({ data: semesters });
  } catch (error) {
    console.error('[Semesters] GET error:', error);
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
    const parsed = createSemesterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    if (parsed.data.isActive) {
      await Semester.updateMany({ createdBy: session.user.id }, { $set: { isActive: false } });
    }

    const semester = await Semester.create({
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      createdBy: session.user.id,
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    console.error('[Semesters] POST error:', error);
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

    if (!id) return NextResponse.json({ error: 'Missing semester id' }, { status: 400 });

    const parsed = updateSemesterSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const updateFields: Record<string, unknown> = { ...parsed.data };
    if (updateFields.startDate) updateFields.startDate = new Date(updateFields.startDate as string);
    if (updateFields.endDate) updateFields.endDate = new Date(updateFields.endDate as string);

    if (parsed.data.isActive === true) {
      await Semester.updateMany(
        { createdBy: session.user.id, _id: { $ne: id } },
        { $set: { isActive: false } }
      );
    }

    const updated = await Semester.findOneAndUpdate(
      { _id: id, createdBy: session.user.id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[Semesters] PATCH error:', error);
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

    if (!id) return NextResponse.json({ error: 'Missing semester id' }, { status: 400 });

    await connectDB();

    const result = await Semester.deleteOne({
      _id: id,
      createdBy: session.user.id,
    });

    if (result.deletedCount === 0)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Semesters] DELETE error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
