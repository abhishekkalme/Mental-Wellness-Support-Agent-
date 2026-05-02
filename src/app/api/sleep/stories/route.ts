import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SleepStory from '@/lib/db/models/SleepStory';

export async function GET() {
  try {
    await connectDB();
    const stories = await SleepStory.find({});
    return NextResponse.json(stories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (Array.isArray(data)) {
      const stories = await SleepStory.insertMany(data);
      return NextResponse.json(stories);
    } else {
      const story = await SleepStory.create(data);
      return NextResponse.json(story);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
