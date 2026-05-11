import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import Therapist from '@/lib/db/models/Therapist';
import { auth } from '@/auth';
import { z } from 'zod';

const TherapistSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  specialty: z.string().min(1, 'Specialty is required'),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
  availability: z.string().min(1, 'Availability is required'),
  img: z.string().min(1, 'Image is required'),
  price: z.string().min(1, 'Price is required'),
  tags: z.array(z.string()).optional(),
});

const BulkTherapistSchema = z.array(TherapistSchema);

export async function GET() {
  try {
    await connectDB();
    const therapists = await Therapist.find({});
    return NextResponse.json(therapists);
  } catch {
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
      const parsed = BulkTherapistSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const newTherapists = await Therapist.insertMany(parsed.data);
      return NextResponse.json(newTherapists);
    } else {
      const parsed = TherapistSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const newTherapist = await Therapist.create(parsed.data);
      return NextResponse.json(newTherapist);
    }
  } catch {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
