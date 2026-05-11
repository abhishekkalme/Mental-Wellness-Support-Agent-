import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import { auth } from '@/auth';
import { chatRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeAndTrim, moderateContent } from '@/lib/utils';
import { z } from 'zod';

const PostSchema = z.object({
  user: z.string().optional(),
  time: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  likes: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  liked: z.boolean().optional(),
  deletedAt: z.any().optional().nullable(),
});

const BulkPostSchema = z.array(PostSchema);

export async function GET() {
  try {
    await connectDB();
    const posts = await CommunityPost.find({ deletedAt: null }).sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    const { success, resetIn } = await chatRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${resetIn}s` },
        { status: 429 }
      );
    }
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    await connectDB();
    const data = await req.json();
    const { _id, ...update } = data;
    if (!_id) return NextResponse.json({ error: 'Missing _id' }, { status: 400 });

    const parsed = PostSchema.safeParse(update);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const validated = parsed.data;
    if (validated.content) {
      validated.content = sanitizeAndTrim(validated.content);
      const mod = moderateContent(validated.content);
      if (!mod.safe) return NextResponse.json({ error: mod.reason }, { status: 400 });
    }
    validated.deletedAt = null;
    const updated = await CommunityPost.findByIdAndUpdate(_id, validated, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    const { success, resetIn } = await chatRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${resetIn}s` },
        { status: 429 }
      );
    }
    const session = await auth();
    if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get('_id');
    if (_id) {
      await CommunityPost.findByIdAndUpdate(_id, { deletedAt: new Date() });
    } else {
      const allPosts = await CommunityPost.find({});
      const updates = allPosts.map((p) => ({
        updateOne: { filter: { _id: p._id }, update: { deletedAt: new Date() } },
      }));
      await CommunityPost.bulkWrite(updates);
    }
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIdentifier(req);
    const { success, resetIn } = await chatRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${resetIn}s` },
        { status: 429 }
      );
    }
    const session = await auth();
    const userId = session?.user?.id || 'anonymous';
    await connectDB();
    const data = await req.json();

    if (Array.isArray(data)) {
      const parsed = BulkPostSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const sanitized = parsed.data.map((item) => ({
        ...item,
        content: sanitizeAndTrim(item.content || ''),
      }));
      const safe = sanitized.every((item) => moderateContent(item.content || '').safe);
      if (!safe)
        return NextResponse.json({ error: 'Content flagged for safety review.' }, { status: 400 });
      const posts = await CommunityPost.insertMany(
        sanitized.map((p) => ({
          ...p,
          user: userId,
          time: p.time || new Date().toISOString(),
          deletedAt: null,
        }))
      );
      return NextResponse.json(posts);
    } else {
      const parsed = PostSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
      }
      const validated = parsed.data;
      const content = sanitizeAndTrim(validated.content);
      const mod = moderateContent(content);
      if (!mod.safe) return NextResponse.json({ error: mod.reason }, { status: 400 });
      const post = await CommunityPost.create({
        ...validated,
        content,
        user: userId,
        time: validated.time || new Date().toISOString(),
        deletedAt: null,
      });
      return NextResponse.json(post);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
