import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CrisisHelpline from '@/lib/db/models/CrisisHelpline';

export async function GET() {
  try {
    await connectDB();
    const helplines = await CrisisHelpline.find({});
    return NextResponse.json(helplines);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (Array.isArray(data)) {
      const helplines = await CrisisHelpline.insertMany(data);
      return NextResponse.json(helplines);
    } else {
      const helpline = await CrisisHelpline.create(data);
      return NextResponse.json(helpline);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
