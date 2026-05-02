import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import JournalEntry from '@/lib/db/models/Journal';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    await connectDB();
    const entries = await JournalEntry.find({ userId: session.user.id }).sort({ timestamp: -1 });
    return NextResponse.json(entries);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    const data = await req.json();
    await connectDB();
    const newEntry = await JournalEntry.create({ ...data, userId: session.user.id });
    return NextResponse.json(newEntry);
  } catch (error) { return new NextResponse('Internal Error', { status: 500 }); }
}
