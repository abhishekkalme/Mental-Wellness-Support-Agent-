import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import { auth } from '@/auth';
import { createAuditLog, getClientInfo } from '@/lib/audit';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.roles?.some((r) => r === 'therapist' || r === 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    let profile = await TherapistProfile.findOne({ userId: session.user.id })
      .populate('userId', 'name email image')
      .lean();

    if (!profile && session.user.roles?.includes('admin')) {
      return NextResponse.json({ error: 'No therapist profile found' }, { status: 404 });
    }

    if (!profile) {
      profile = await TherapistProfile.create({
        userId: session.user.id,
        bio: '',
        title: '',
        specializations: [],
        languages: ['en'],
        sessionTypes: ['video'],
        pricing: { chat: 30, video: 50, phone: 40 },
        currency: 'USD',
        timezone: 'UTC',
        verificationStatus: 'pending',
        isActive: true,
        sessionDuration: 50,
      });
    }

    return NextResponse.json(profile);
  } catch (e) {
    console.error('[therapists/profile]', e);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.user.roles?.some((r) => r === 'therapist' || r === 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const allowedFields = [
      'bio',
      'title',
      'education',
      'specializations',
      'languages',
      'sessionTypes',
      'pricing',
      'currency',
      'timezone',
      'sessionDuration',
      'yearsOfExperience',
      'gender',
      'address',
      'acceptsInsurance',
      'insuranceProviders',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const existing = await TherapistProfile.findOne({ userId: session.user.id });
    if (existing && existing.verificationStatus === 'pending' && body.bio && body.title) {
      updateData.verificationStatus = 'verified';
    }

    const profile = await TherapistProfile.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    )
      .populate('userId', 'name email image')
      .lean();

    const { ipAddress, userAgent } = getClientInfo(req);
    await createAuditLog({
      actorId: session.user.id,
      action: 'update_profile',
      resource: 'therapist-profile',
      resourceId: String(profile._id),
      details: { updatedFields: Object.keys(updateData) },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(profile);
  } catch (e) {
    console.error('[therapists/profile]', e);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
