'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Clock,
  Globe,
  GraduationCap,
  Video,
  MessageSquare,
  Phone,
  Bookmark,
  BookmarkCheck,
  MapPin,
  CalendarDays,
  CheckCircle2,
  X,
  Loader2,
  HeartPulse,
  Award,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TherapistProfile, AvailabilitySlot, Review } from '@/lib/types';
import { getCurrencySymbol, formatPrice } from '@/lib/currency';

interface ProfileData {
  profile: TherapistProfile & { user?: { name: string; email: string; image?: string } | null };
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  upcomingSlots: AvailabilitySlot[];
  isFavorited: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  ur: 'Urdu',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TherapistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingType, setBookingType] = useState<'chat' | 'video' | 'phone'>('video');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookError, setBookError] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/therapists/${id}`);
        if (!res.ok) throw new Error('Not found');
        const d = await res.json();
        setData(d);
        setIsFav(d.isFavorited);
      } catch {
        setError('Failed to load therapist profile');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const toggleFavorite = async () => {
    setFavLoading(true);
    try {
      const res = await fetch('/api/therapists/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId: id }),
      });
      if (res.ok) {
        const { favorited } = await res.json();
        setIsFav(favorited);
      }
    } catch {
    } finally {
      setFavLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const bookSession = async () => {
    if (!selectedSlot || !data) return;
    setBookingLoading(true);
    setBookError('');
    try {
      const [date, time] = selectedSlot.split('|');
      const res = await fetch('/api/therapists/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId: (data.profile.userId as any)?._id || id,
          therapistProfileId: id,
          therapistName: (data.profile.userId as any)?.name || 'Therapist',
          date,
          time,
          type: bookingType,
          duration: data.profile.sessionDuration || 50,
        }),
      });
      if (res.status === 409) {
        setBookError('This slot is already booked. Please select another.');
        return;
      }
      if (!res.ok) {
        setBookError('Failed to book. Please try again.');
        return;
      }

      const booking = await res.json();

      const payRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking._id }),
      });
      if (!payRes.ok) {
        setBooked(true);
        setBookError('Session booked! Payment setup failed — contact therapist to pay.');
        return;
      }

      const payData = await payRes.json();

      if (payData.gateway === 'stripe' && payData.url) {
        window.location.href = payData.url;
      } else if (payData.gateway === 'razorpay') {
        await loadRazorpayScript();
        const rp = new (window as any).Razorpay({
          key: payData.keyId,
          amount: payData.amount,
          currency: payData.currency,
          name: payData.name,
          description: payData.description,
          order_id: payData.orderId,
          prefill: payData.prefill,
          handler: () => {
            setBooked(true);
          },
          modal: {
            ondismiss: () => {
              setBooked(true);
              setBookError('Payment cancelled. Your session is booked but unpaid.');
            },
          },
        });
        rp.open();
      } else {
        setBooked(true);
      }
    } catch {
      setBookError('Failed to book. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-white/10 rounded" />
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-64 bg-white/10 rounded" />
              <div className="h-5 w-40 bg-white/5 rounded" />
              <div className="h-4 w-48 bg-white/5 rounded" />
            </div>
          </div>
          <div className="h-48 bg-white/5 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Therapist Not Found</h2>
        <Link href="/therapists" className="text-purple-400 hover:underline">
          Back to directory
        </Link>
      </main>
    );
  }

  const { profile, reviews, averageRating, totalReviews, completedSessions, upcomingSlots } = data;
  const p = profile;

  const slotDate = (slot: AvailabilitySlot) => {
    if (slot.specificDate) return new Date(slot.specificDate).toISOString().split('T')[0];
    const today = new Date();
    const dow = (slot.dayOfWeek ?? 0) % 7;
    const diff = (dow - today.getDay() + 7) % 7;
    const d = new Date(today);
    d.setDate(d.getDate() + diff + (slot.dayOfWeek >= 7 ? 7 : 0));
    return d.toISOString().split('T')[0];
  };

  const slotLabel = (slot: AvailabilitySlot) => {
    if (slot.specificDate) {
      const d = new Date(slot.specificDate);
      return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} ${slot.startTime}`;
    }
    const dow = slot.dayOfWeek ?? 0;
    return `${DAY_NAMES[dow % 7].slice(0, 3)} ${slot.startTime}`;
  };

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <Link
        href="/therapists"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {booked ? (
          <div className="glass-panel p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold">Session Booked!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your session with {p.user?.name || 'Therapist'} has been confirmed. Check your
              sessions page for details.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/therapists/sessions">
                <Button className="bg-purple-500 text-white hover:bg-purple-600 rounded-2xl px-8 h-12">
                  View My Sessions
                </Button>
              </Link>
              <Link href="/therapists">
                <Button variant="outline" className="rounded-2xl h-12 px-8">
                  Back to Directory
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="glass-panel p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400/20 to-rose-400/20 flex items-center justify-center text-4xl font-bold text-purple-400 shrink-0 overflow-hidden">
                  {p.user?.image ? (
                    <img src={p.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (p.user?.name || 'T')[0].toUpperCase()
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{p.user?.name || 'Therapist'}</h1>
                      <p className="text-lg text-purple-400 font-medium">{p.title}</p>
                    </div>
                    <button
                      onClick={toggleFavorite}
                      disabled={favLoading}
                      className="p-2 rounded-xl hover:bg-secondary transition-colors"
                    >
                      {isFav ? (
                        <BookmarkCheck className="w-6 h-6 text-purple-400" />
                      ) : (
                        <Bookmark className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                      {totalReviews > 0 && (
                        <span className="text-muted-foreground font-normal">
                          ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Award className="w-4 h-4 text-emerald-500" />
                      {completedSessions} session{completedSessions !== 1 ? 's' : ''}
                    </div>
                    {p.verificationStatus === 'verified' && (
                      <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" /> Verified
                      </div>
                    )}
                    {p.yearsOfExperience > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <GraduationCap className="w-4 h-4" /> {p.yearsOfExperience}yr
                        {p.yearsOfExperience > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Languages className="w-3 h-3" />{' '}
                      {p.languages?.map((l) => LANGUAGE_NAMES[l] || l).join(', ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.timezone}
                    </span>
                    {p.acceptsInsurance && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <ShieldCheck className="w-3 h-3" /> Accepts Insurance
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {p.bio && (
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    About
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{p.bio}</p>
                </div>
              )}

              {p.education && p.education.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Education
                  </h3>
                  <div className="space-y-2">
                    {p.education.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="font-medium">{e.degree}</span>
                          <span className="text-muted-foreground">
                            {' '}
                            — {e.institution}, {e.year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {p.specializations?.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-purple-400/10 text-purple-400 rounded-lg text-xs font-bold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" /> Available Slots
                </h3>
                {upcomingSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No upcoming availability. Check back later.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {upcomingSlots.slice(0, 8).map((slot, i) => {
                      const key = `${slotDate(slot)}|${slot.startTime}`;
                      const isSelected = selectedSlot === key;
                      return (
                        <button
                          key={i}
                          onClick={() => setSelectedSlot(key)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-purple-500 text-white border-purple-500'
                              : 'glass-panel hover:bg-purple-400/10 border-transparent'
                          }`}
                        >
                          <span className="block">{slotLabel(slot)}</span>
                          <span className="block opacity-60">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="glass-panel p-6 space-y-4">
                <h3 className="font-bold">Book a Session</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
                      Session Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['video', 'chat', 'phone'] as const).map((type) => {
                        const Icon =
                          type === 'video' ? Video : type === 'chat' ? MessageSquare : Phone;
                        const isActive = bookingType === type;
                        const price = p.pricing?.[type] || 0;
                        const isAvailable = p.sessionTypes?.includes(type);
                        return (
                          <button
                            key={type}
                            disabled={!isAvailable}
                            onClick={() => setBookingType(type)}
                            className={`p-3 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-purple-500 text-white'
                                : isAvailable
                                  ? 'glass-panel hover:bg-purple-400/10'
                                  : 'glass-panel opacity-30 cursor-not-allowed'
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto mb-1" />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                            <span className="block mt-1 opacity-70">
                              {getCurrencySymbol(p.currency)}
                              {price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {bookError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                      {bookError}
                    </div>
                  )}

                  <Button
                    className="w-full bg-purple-500 text-white hover:bg-purple-600 rounded-2xl h-14 text-base font-bold disabled:opacity-40"
                    onClick={bookSession}
                    disabled={!selectedSlot || bookingLoading}
                  >
                    {bookingLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Booking...
                      </span>
                    ) : (
                      `Book ${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Session — ${getCurrencySymbol(p.currency)}${p.pricing?.[bookingType] || 0}`
                    )}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center">
                    By booking, you agree to the terms of service and consent to teletherapy.
                  </p>
                </div>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Reviews ({totalReviews})
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review._id} className="p-4 rounded-xl bg-background/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/20 to-rose-400/20 flex items-center justify-center text-xs font-bold">
                            {review.isAnonymous ? 'A' : (review.user?.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {review.isAnonymous ? 'Anonymous' : review.user?.name || 'User'}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.content}</p>
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verified Session
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </main>
  );
}
