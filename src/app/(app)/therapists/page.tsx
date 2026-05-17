'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Search,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  CheckCircle2,
  Phone,
  Loader2,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Video,
  MessageSquare,
  Globe,
  GraduationCap,
  Heart,
  Bookmark,
  CalendarCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TherapistProfile } from '@/lib/types';
import { getCurrencySymbol } from '@/lib/currency';
import toast from 'react-hot-toast';

interface SearchResult {
  therapists: (TherapistProfile & {
    averageRating: number;
    totalReviews: number;
    user?: { name: string; email: string; image?: string } | null;
  })[];
  total: number;
  page: number;
  totalPages: number;
}

const SPECIALIZATIONS = [
  'Anxiety',
  'Depression',
  'Stress',
  'Trauma',
  'PTSD',
  'ADHD',
  'Relationships',
  'Grief',
  'Sleep',
  'Self-Esteem',
  'Burnout',
  'OCD',
  'Bipolar',
  'Eating Disorders',
  'Addiction',
  'Career',
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ur', name: 'Urdu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
];

const SESSION_TYPES = [
  { value: 'video', label: 'Video', icon: Video },
  { value: 'chat', label: 'Chat', icon: MessageSquare },
  { value: 'phone', label: 'Phone', icon: Phone },
];

export default function TherapistDirectoryPage() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    specialization: '',
    language: '',
    sessionType: '',
    minRating: 0,
    maxPrice: 0,
    gender: '',
    insurance: false,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchTherapists = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (filters.specialization) params.set('specialization', filters.specialization);
        if (filters.language) params.set('language', filters.language);
        if (filters.sessionType) params.set('sessionType', filters.sessionType);
        if (filters.minRating > 0) params.set('minRating', String(filters.minRating));
        if (filters.maxPrice > 0) params.set('maxPrice', String(filters.maxPrice));
        if (filters.gender) params.set('gender', filters.gender);
        if (filters.insurance) params.set('insurance', 'true');
        params.set('page', String(p));
        params.set('limit', '20');

        const res = await fetch(`/api/therapists/search?${params}`);
        if (res.ok) {
          setSearchResult(await res.json());
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load therapists');
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filters]
  );

  useEffect(() => {
    fetchTherapists(page);
  }, [fetchTherapists, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  const therapists = searchResult?.therapists || [];
  const totalPages = searchResult?.totalPages || 1;

  return (
    <main id="main-content" className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <HeartPulse className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Professional Help</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Find Your Therapist</h1>
          <p className="text-muted-foreground text-lg italic">
            Connect with verified licensed professionals specialized in your needs.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialty..."
              className="w-full pl-10 pr-4 h-12 rounded-2xl glass-panel bg-background/50 border-border focus:ring-2 focus:ring-purple-400 outline-none text-sm transition-all"
            />
          </div>
          <Link
            href="/therapists/sessions"
            className="h-12 px-4 rounded-2xl glass-panel flex items-center gap-2 text-sm font-bold text-purple-400 hover:bg-purple-400/10 transition-colors"
          >
            <CalendarCheck className="w-4 h-4" /> My Sessions
          </Link>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden h-12 w-12 rounded-2xl glass-panel flex items-center justify-center hover:bg-purple-400/10 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside
          className={`lg:col-span-1 space-y-6 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}
        >
          <div className="glass-panel p-6 bg-purple-400/5 border-purple-400/20 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              <button
                onClick={() => {
                  setFilters({
                    specialization: '',
                    language: '',
                    sessionType: '',
                    minRating: 0,
                    maxPrice: 0,
                    gender: '',
                    insurance: false,
                  });
                  setSearchQuery('');
                }}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters((f) => ({ ...f, specialization: e.target.value }))}
                className="w-full rounded-xl bg-background/50 border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Language</label>
              <select
                value={filters.language}
                onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value }))}
                className="w-full rounded-xl bg-background/50 border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Session Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SESSION_TYPES.map((st) => {
                  const Icon = st.icon;
                  const isActive = filters.sessionType === st.value;
                  return (
                    <button
                      key={st.value}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          sessionType: f.sessionType === st.value ? '' : st.value,
                        }))
                      }
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'glass-panel hover:bg-purple-400/10 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() =>
                      setFilters((f) => ({ ...f, minRating: f.minRating === r ? 0 : r }))
                    }
                    className={`flex-1 p-2 rounded-xl text-xs font-bold transition-all ${
                      filters.minRating === r
                        ? 'bg-amber-500 text-white'
                        : 'glass-panel hover:bg-amber-400/10'
                    }`}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters((f) => ({ ...f, gender: e.target.value }))}
                className="w-full rounded-xl bg-background/50 border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setFilters((f) => ({ ...f, insurance: !f.insurance }))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  filters.insurance
                    ? 'bg-purple-400 border-purple-400'
                    : 'border-border group-hover:border-purple-400'
                }`}
              >
                {filters.insurance && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
              </div>
              <span className="text-sm font-medium">Accepts Insurance</span>
            </label>
          </div>

          <div className="glass-panel p-6 border-dashed border-2 border-border text-center space-y-4">
            <Phone className="w-8 h-8 text-rose-400 mx-auto" />
            <h4 className="font-bold">Need Help Now?</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">
              24/7 Crisis Support
            </p>
            <Link href="/crisis">
              <Button variant="outline" size="sm" className="w-full">
                Get Help
              </Button>
            </Link>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="glass-panel p-6 space-y-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-40 bg-white/10 rounded" />
                      <div className="h-4 w-24 bg-white/5 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-white/10 rounded" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-white/5 rounded" />
                    <div className="h-6 w-20 bg-white/5 rounded" />
                    <div className="h-6 w-14 bg-white/5 rounded" />
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                    <div className="h-4 w-16 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : therapists.length === 0 ? (
            <div className="glass-panel p-20 text-center flex flex-col items-center justify-center border-purple-400/10 bg-purple-400/5 rounded-[40px]">
              <Search className="w-12 h-12 text-purple-400/40 mb-6" />
              <h2 className="text-3xl font-bold mb-3">No Therapists Found</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                No verified therapists match your current filters. Try adjusting your search
                criteria.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    specialization: '',
                    language: '',
                    sessionType: '',
                    minRating: 0,
                    maxPrice: 0,
                    gender: '',
                    insurance: false,
                  });
                  setSearchQuery('');
                }}
                className="px-6 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-sm hover:bg-purple-500/20 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Showing {therapists.length} of {searchResult?.total || 0} therapists
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {therapists.map((t, idx) => (
                  <Link key={String(t._id)} href={`/therapists/${t._id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="glass-panel p-6 space-y-4 group hover:border-purple-400/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-rose-400/20 flex items-center justify-center text-2xl font-bold text-purple-400 shrink-0 overflow-hidden">
                            {t.user?.image ? (
                              <img
                                src={t.user.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (t.user?.name || 'T')[0].toUpperCase()
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors">
                              {t.user?.name || 'Therapist'}
                            </h3>
                            <p className="text-sm text-primary font-medium">{t.title}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {t.averageRating > 0 ? t.averageRating.toFixed(1) : 'New'}
                          </div>
                          {t.totalReviews > 0 && (
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">
                              {t.totalReviews} review{t.totalReviews !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {t.specializations?.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 bg-secondary rounded-md text-[10px] font-bold uppercase text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                        {(t.specializations?.length || 0) > 4 && (
                          <span className="px-2.5 py-1 bg-secondary rounded-md text-[10px] font-bold text-muted-foreground">
                            +{t.specializations!.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {t.languages
                            ?.map((l) => LANGUAGES.find((la) => la.code === l)?.name || l)
                            .join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {t.yearsOfExperience > 0
                            ? `${t.yearsOfExperience}yr${t.yearsOfExperience > 1 ? 's' : ''}`
                            : 'New'}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.verificationStatus === 'verified' && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <Video className="w-3 h-3" /> {t.sessionTypes?.join(', ')}
                          </span>
                        </div>
                        <p className="text-sm font-bold">
                          {getCurrencySymbol(t.currency)}
                          {t.pricing?.video || t.pricing?.chat || 0}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            /session
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-mono text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
