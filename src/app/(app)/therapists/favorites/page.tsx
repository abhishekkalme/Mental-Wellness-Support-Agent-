'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookmarkCheck,
  Star,
  ShieldCheck,
  Video,
  Globe,
  GraduationCap,
  ArrowLeft,
  Heart,
} from 'lucide-react';
import type { TherapistProfile } from '@/lib/types';
import { getCurrencySymbol } from '@/lib/currency';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/therapists/favorites')
      .then((r) => (r.ok ? r.json() : { favorites: [] }))
      .then((d) => setFavorites(d.favorites || []))
      .catch(() => toast.error('Failed to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <Link
        href="/therapists"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      <div className="flex items-center gap-3 text-purple-400 mb-2">
        <BookmarkCheck className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Saved Therapists</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="glass-panel p-16 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Saved Therapists</h2>
          <p className="text-muted-foreground mb-6">
            Save therapists you&apos;re interested in to find them quickly later.
          </p>
          <Link
            href="/therapists"
            className="px-6 py-3 rounded-2xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-all"
          >
            Browse Therapists
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((t: any) => (
            <Link key={t._id} href={`/therapists/${t._id}`}>
              <div className="glass-panel p-6 space-y-4 hover:border-purple-400/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400/20 to-rose-400/20 flex items-center justify-center text-xl font-bold text-purple-400">
                      {t.user?.name?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{t.user?.name || 'Therapist'}</h3>
                      <p className="text-sm text-purple-400">{t.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {t.averageRating > 0 ? t.averageRating.toFixed(1) : 'New'}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.specializations?.slice(0, 3).map((s: string) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-secondary rounded-md text-[10px] font-bold uppercase text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {t.languages?.join(', ')}
                  </span>
                  {t.verificationStatus === 'verified' && (
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  )}
                  <span className="ml-auto font-bold">
                    {getCurrencySymbol(t.currency)}
                    {t.pricing?.video || t.pricing?.chat || 0}/session
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
