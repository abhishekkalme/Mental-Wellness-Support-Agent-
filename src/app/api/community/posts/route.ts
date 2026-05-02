import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';

export async function GET() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({}).sort({ _id: -1 });
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (Array.isArray(data)) {
      const posts = await CommunityPost.insertMany(data);
      return NextResponse.json(posts);
    } else {
      const post = await CommunityPost.create(data);
      return NextResponse.json(post);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
