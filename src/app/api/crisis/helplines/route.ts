import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CrisisHelpline from '@/lib/db/models/CrisisHelpline';
import { z } from 'zod';

const HelplineSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  link: z.string().optional(),
});

const BulkHelplineSchema = z.array(HelplineSchema);

export async function GET() {
  try {
    await connectDB();
    const helplines = await CrisisHelpline.find({});
    return NextResponse.json(helplines);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (Array.isArray(data)) {
      const parsed = BulkHelplineSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const helplines = await CrisisHelpline.insertMany(parsed.data);
      return NextResponse.json(helplines);
    } else {
      const parsed = HelplineSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const helpline = await CrisisHelpline.create(parsed.data);
      return NextResponse.json(helpline);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
