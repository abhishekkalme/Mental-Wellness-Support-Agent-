import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityTag from '@/lib/db/models/CommunityTag';

export async function GET() {
  try {
    await connectDB();

    const tags = await CommunityTag.find({}).sort({ usageCount: -1 }).limit(50).lean();

    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
