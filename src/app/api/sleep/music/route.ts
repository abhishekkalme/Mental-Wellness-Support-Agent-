import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SleepMusic from '@/lib/db/models/SleepMusic';

export async function GET() {
  try {
    await connectDB();
    const music = await SleepMusic.find({});
    return NextResponse.json(music);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (Array.isArray(data)) {
      const music = await SleepMusic.insertMany(data);
      return NextResponse.json(music);
    } else {
      const track = await SleepMusic.create(data);
      return NextResponse.json(track);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
