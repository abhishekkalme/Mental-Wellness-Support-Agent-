import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import AcademicEvent from '@/lib/db/models/AcademicEvent';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    
    await connectDB();
    const events = await AcademicEvent.find({ userId: session.user.id }).sort({ date: 1 });
    return NextResponse.json(events);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    
    const data = await req.json();
    await connectDB();
    
    if (Array.isArray(data)) {
      const newEvents = await AcademicEvent.insertMany(
        data.map(e => ({ ...e, userId: session.user.id }))
      );
      return NextResponse.json(newEvents);
    } else {
      const newEvent = await AcademicEvent.create({ ...data, userId: session.user.id });
      return NextResponse.json(newEvent);
    }
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
