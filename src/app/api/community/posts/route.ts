import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import CommunityPost from '@/lib/db/models/CommunityPost';
import CommunityTag from '@/lib/db/models/CommunityTag';
import CommunityReaction from '@/lib/db/models/CommunityReaction';
import SavedPost from '@/lib/db/models/SavedPost';
import { auth } from '@/auth';
import { chatRateLimit, getClientIdentifier } from '@/lib/rateLimit';
import { sanitizeAndTrim, moderateContent } from '@/lib/utils';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
  type: z
    .enum(['discussion', 'support', 'achievement', 'question', 'resource'])
    .default('discussion'),
  isAnonymous: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10).default([]),
  language: z.string().default('en'),
  mood: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const authorId = searchParams.get('author');

    await connectDB();

    const filter: Record<string, unknown> = {
      deletedAt: null,
      moderationStatus: { $ne: 'removed' },
    };

    if (type) filter.type = type;
    if (tag) filter.tags = tag;
    if (authorId) filter.author = authorId;

    let query = CommunityPost.find(filter).populate('author', 'name username image roles');

    if (cursor) {
      const cursorDoc = await CommunityPost.findById(cursor).select('createdAt');
      if (cursorDoc) {
        query = query.where('createdAt').lt(cursorDoc.createdAt);
      }
    }

    const posts = await query
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    const postIds = posts.map((p) => p._id.toString());

    const userReactions: Map<string, string | null> = new Map();
    const savedSet: Set<string> = new Set();

    if (userId) {
      const reactions = await CommunityReaction.find({
        user: userId,
        targetType: 'post',
        targetId: { $in: postIds },
      }).lean();

      for (const r of reactions) {
        userReactions.set(r.targetId.toString(), r.emoji);
      }

      const saved = await SavedPost.find({
        user: userId,
        post: { $in: postIds },
      }).lean();

      for (const s of saved) {
        savedSet.add(s.post.toString());
      }
    }

    const enriched = posts.map((post) => ({
      ...post,
      isLiked: userReactions.has(post._id.toString()),
      userReaction: userReactions.get(post._id.toString()) || null,
      isSaved: savedSet.has(post._id.toString()),
    }));

    return NextResponse.json({
      data: enriched,
      nextCursor: hasMore ? posts[posts.length - 1]?._id.toString() : null,
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const parsed = CreatePostSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const content = sanitizeAndTrim(parsed.data.content);
    const title = sanitizeAndTrim(parsed.data.title);

    if (!content || !title) {
      return NextResponse.json({ error: 'Content and title are required' }, { status: 400 });
    }

    const mod = moderateContent(`${title} ${content}`);
    if (!mod.safe) {
      return NextResponse.json({ error: mod.reason }, { status: 400 });
    }

    const post = await CommunityPost.create({
      author: session.user.id,
      title,
      content,
      type: parsed.data.type,
      isAnonymous: parsed.data.isAnonymous,
      tags: parsed.data.tags,
      language: parsed.data.language,
      mood: parsed.data.mood,
    });

    for (const tagName of parsed.data.tags) {
      await CommunityTag.findOneAndUpdate(
        { name: tagName.toLowerCase().trim() },
        { $inc: { usageCount: 1 } },
        { upsert: true }
      ).catch(() => {});
    }

    const populated = await CommunityPost.findById(post._id)
      .populate('author', 'name username image roles')
      .lean();

    return NextResponse.json(
      { ...populated, isLiked: false, userReaction: null, isSaved: false },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    );
  }
}
