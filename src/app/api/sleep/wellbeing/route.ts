import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import SleepWellbeing from '@/lib/db/models/SleepWellbeing';

export async function GET() {
  try {
    await connectDB();
    const wellbeing = await SleepWellbeing.find({});
    return NextResponse.json(wellbeing);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (Array.isArray(data)) {
      const wellbeing = await SleepWellbeing.insertMany(data);
      return NextResponse.json(wellbeing);
    } else {
      const entry = await SleepWellbeing.create(data);
      return NextResponse.json(entry);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
