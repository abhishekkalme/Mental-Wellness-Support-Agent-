import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CrisisProfile from '@/lib/db/models/CrisisProfile';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    
    let profile = await CrisisProfile.findOne({ user: session.user.id });
    if (!profile) {
      profile = await CrisisProfile.create({ user: session.user.id });
    }
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch crisis profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    await connectDB();
    
    const profile = await CrisisProfile.findOneAndUpdate(
      { user: session.user.id },
      { $set: data },
      { new: true, upsert: true }
    );
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update crisis profile' }, { status: 500 });
  }
}
