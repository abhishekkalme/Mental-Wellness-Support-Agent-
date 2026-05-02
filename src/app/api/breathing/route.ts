import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import BreathingRecord from '@/lib/db/models/Breathing';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    await connectDB();
    const entries = await BreathingRecord.find({ userId: session.user.id }).sort({ date: -1 });
    return NextResponse.json(entries);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    const data = await req.json();
    await connectDB();
    const newEntry = await BreathingRecord.create({ ...data, userId: session.user.id });
    return NextResponse.json(newEntry);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}
