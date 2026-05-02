import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Meditation from '@/lib/db/models/Meditation';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const meditations = await Meditation.find({});
    return NextResponse.json(meditations);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    // Allow admins to seed data
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    
    const data = await req.json();
    await connectDB();
    
    if (Array.isArray(data)) {
      const newMeditations = await Meditation.insertMany(data);
      return NextResponse.json(newMeditations);
    } else {
      const newMeditation = await Meditation.create(data);
      return NextResponse.json(newMeditation);
    }
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
