import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Therapist from '@/lib/db/models/Therapist';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const therapists = await Therapist.find({});
    return NextResponse.json(therapists);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });
    
    const data = await req.json();
    await connectDB();
    
    if (Array.isArray(data)) {
      const newTherapists = await Therapist.insertMany(data);
      return NextResponse.json(newTherapists);
    } else {
      const newTherapist = await Therapist.create(data);
      return NextResponse.json(newTherapist);
    }
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
