import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityGroup from '@/lib/db/models/CommunityGroup';

export async function GET() {
  try {
    await connectDB();
    const groups = await CommunityGroup.find({});
    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (Array.isArray(data)) {
      const groups = await CommunityGroup.insertMany(data);
      return NextResponse.json(groups);
    } else {
      const group = await CommunityGroup.create(data);
      return NextResponse.json(group);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
