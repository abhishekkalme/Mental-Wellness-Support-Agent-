import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import TherapistProfile from '@/lib/db/models/TherapistProfile';
import Review from '@/lib/db/models/Review';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || '';
    const specialization = searchParams.get('specialization') || '';
    const language = searchParams.get('language') || '';
    const sessionType = searchParams.get('sessionType') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '0');
    const gender = searchParams.get('gender') || '';
    const insurance = searchParams.get('insurance') || '';
    const timezone = searchParams.get('timezone') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

    const filter: Record<string, unknown> = {
      isActive: true,
      verificationStatus: 'verified',
    };

    if (query) {
      filter.$or = [
        { specializations: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
      ];
    }

    if (specialization) {
      filter.specializations = { $in: [new RegExp(specialization, 'i')] };
    }

    if (language) {
      filter.languages = { $in: [new RegExp(language, 'i')] };
    }

    if (sessionType) {
      filter.sessionTypes = sessionType;
    }

    if (gender) {
      filter.gender = { $regex: gender, $options: 'i' };
    }

    if (insurance === 'true') {
      filter.acceptsInsurance = true;
    }

    if (timezone) {
      filter.timezone = { $regex: timezone, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      TherapistProfile.find(filter)
        .populate('userId', 'name email image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TherapistProfile.countDocuments(filter),
    ]);

    const therapistIds = profiles.map((p: Record<string, unknown>) => p._id);
    const aggregation = await Review.aggregate([
      { $match: { therapistId: { $in: therapistIds }, isFlagged: false } },
      {
        $group: {
          _id: '$therapistId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingMap = new Map<string, { averageRating: number; totalReviews: number }>();
    for (const r of aggregation) {
      ratingMap.set(String(r._id), {
        averageRating: Math.round(r.averageRating * 10) / 10,
        totalReviews: r.totalReviews,
      });
    }

    const enriched = profiles.map((p: Record<string, unknown>) => {
      const ratings = ratingMap.get(String(p._id));
      const user = p.userId as Record<string, unknown> | null;
      return {
        ...p,
        averageRating: ratings?.averageRating || 0,
        totalReviews: ratings?.totalReviews || 0,
        user: user ? { name: user.name, email: user.email, image: user.image } : null,
      };
    });

    if (minRating > 0) {
      const filtered = enriched.filter(
        (p: Record<string, unknown>) => (p.averageRating as number) >= minRating
      );
      return NextResponse.json({
        therapists: filtered,
        total: filtered.length,
        page: 1,
        totalPages: 1,
      });
    }

    return NextResponse.json({
      therapists: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error('[therapists/search]', e);
    return NextResponse.json({ error: 'Failed to search therapists' }, { status: 500 });
  }
}
