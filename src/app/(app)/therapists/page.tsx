'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Therapist } from '@/lib/types';
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
  Database,
  Plus,
} from 'lucide-react';

const initialTherapists = [
  {
    id: 't1',
    name: 'Dr. Sarah Mitchell',
    specialty: 'CBT & Anxiety Specialist',
    rating: 4.9,
    reviews: 124,
    availability: 'Tomorrow, 2:00 PM',
    img: '👩‍⚕️',
    price: '$80/hr',
    tags: ['Anxiety', 'Depression', 'CBT'],
  },
  {
    id: 't2',
    name: 'Dr. Robert Chen',
    specialty: 'Student Life & Burnout',
    rating: 4.8,
    reviews: 98,
    availability: 'Friday, 10:00 AM',
    img: '👨‍⚕️',
    price: '$95/hr',
    tags: ['Burnout', 'Academic', 'Grief'],
  },
  {
    id: 't3',
    name: 'Maria Rodriguez, LCSW',
    specialty: 'Trauma & Relationships',
    rating: 5.0,
    reviews: 210,
    availability: 'next week',
    img: '👩‍⚕️',
    price: '$75/hr',
    tags: ['Trauma', 'LGBTQ+', 'Family'],
  },
];

export default function TherapistPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Therapist | null>(null);
  const [booked, setBooked] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    online: false,
    inPerson: false,
    slidingScale: false,
    crisisReady: false,
  });

  const filteredTherapists = useMemo(() => {
    if (!searchQuery.trim() && !Object.values(filters).some(Boolean)) {
      return therapists;
    }
    const query = searchQuery.toLowerCase();
    return therapists.filter((t) => {
      const matchesSearch = searchQuery.trim()
        ? t.name.toLowerCase().includes(query) ||
          t.specialty.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
        : true;
      return matchesSearch;
    });
  }, [therapists, searchQuery, filters]);

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/therapists');
      const data = await res.json();
      setTherapists(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/therapists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialTherapists),
      });
      fetchTherapists();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  const toggleFilter = useCallback((key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    fetchTherapists();
  }, []);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-rose-400 mb-2">
            <HeartPulse className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Professional Help</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Therapist Directory</h1>
          <p className="text-muted-foreground text-lg italic">
            Connect with licensed professionals specialized in student wellbeing.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by specialty, name..."
            className="w-full pl-10 pr-4 h-12 rounded-2xl glass-panel bg-background/50 border-border focus:ring-2 focus:ring-rose-400 outline-none text-sm transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 bg-rose-400/5 border-rose-400/20 space-y-6">
            <h3 className="font-bold text-lg">Filter Specialists</h3>
            <div className="space-y-4">
              {[
                { key: 'online' as const, label: 'Online Sessions' },
                { key: 'inPerson' as const, label: 'In-person' },
                { key: 'slidingScale' as const, label: 'Sliding Scale' },
                { key: 'crisisReady' as const, label: 'Crisis Ready' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => toggleFilter(key)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${filters[key] ? 'bg-rose-400 border-rose-400' : 'border-border group-hover:border-rose-400'}`}
                  >
                    {filters[key] && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <span className="text-sm font-medium text-foreground/80">{label}</span>
                </label>
              ))}
            </div>
            {(searchQuery || Object.values(filters).some(Boolean)) && (
              <Button
                variant="ghost"
                className="w-full text-rose-400 hover:text-rose-500 hover:bg-rose-400/10"
                onClick={() => { setSearchQuery(''); setFilters({ online: false, inPerson: false, slidingScale: false, crisisReady: false }); }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="glass-panel p-8 border-dashed border-2 border-border text-center space-y-4">
            <Phone className="w-8 h-8 text-rose-400 mx-auto" />
            <h4 className="font-bold">Need Help Now?</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">
              24/7 Crisis Hotline
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Call Now
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="glass-panel p-8 space-y-6 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="text-5xl w-20 h-20 glass-panel flex items-center justify-center bg-white/5 rounded-xl">
                      <div className="w-12 h-12 bg-white/10 rounded-lg" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 w-16 bg-white/10 rounded" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-white/10 rounded" />
                    <div className="h-4 w-32 bg-white/5 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-white/5 rounded" />
                    <div className="h-6 w-20 bg-white/5 rounded" />
                    <div className="h-6 w-14 bg-white/5 rounded" />
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="h-3 w-20 bg-white/5 rounded" />
                      <div className="h-4 w-24 bg-white/10 rounded" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="h-3 w-20 bg-white/5 rounded" />
                      <div className="h-5 w-12 bg-white/10 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : therapists.length === 0 ? (
            <div className="glass-panel p-20 text-center flex flex-col items-center justify-center border-rose-400/10 bg-rose-400/5 shadow-2xl relative overflow-hidden rounded-[40px]">
              <div className="absolute inset-0 bg-gradient-to-b from-rose-400/5 to-transparent opacity-30" />
              <div className="w-24 h-24 rounded-[32px] bg-rose-400/10 text-rose-400 flex items-center justify-center mb-8 shadow-xl shadow-rose-400/5 relative z-10">
                <Database className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white relative z-10 tracking-tight">
                Directory Unavailable
              </h2>
              <p className="text-white/40 max-w-lg mx-auto text-lg font-medium leading-relaxed relative z-10 mb-10">
                No licensed professionals are currently listed in your region. Initialize the
                standard directory of university-affiliated specialists.
              </p>
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="h-16 px-12 rounded-2xl bg-rose-400 hover:bg-rose-500 text-white font-bold text-lg relative z-10 shadow-2xl shadow-rose-400/20"
              >
                {isSeeding ? (
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                ) : (
                  <Plus className="w-6 h-6 mr-2" />
                )}
                Initialize Directory
              </Button>
            </div>
          ) : filteredTherapists.length === 0 ? (
            <div className="glass-panel p-20 text-center border-rose-400/10 bg-rose-400/5 rounded-[40px]">
              <p className="text-white/40 text-lg mb-4">No specialists match your search.</p>
              <button
                onClick={() => { setSearchQuery(''); setFilters({ online: false, inPerson: false, slidingScale: false, crisisReady: false }); }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/30 text-[#E2FF6F] font-bold text-sm hover:bg-[#E2FF6F]/20 transition-all"
              >
                <Search className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTherapists.map((t) => (
                <motion.div
                  key={t.id}
                  whileHover={{ y: -5 }}
                  className="glass-panel p-8 space-y-6 group hover:border-rose-400/30 transition-all cursor-pointer"
                  onClick={() => setSelected(t)}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-5xl w-20 h-20 glass-panel flex items-center justify-center bg-rose-400/5">
                      {t.img}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> {t.rating}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {t.reviews} reviews
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold group-hover:text-rose-400 transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-sm text-primary font-medium">{t.specialty}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary rounded-md text-[10px] font-bold uppercase text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Availability
                      </span>
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.availability}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Session Flat Fee
                      </span>
                      <p className="text-sm font-bold text-foreground">{t.price}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel p-10 w-full max-w-2xl relative shadow-2xl space-y-8"
            >
              <button
                onClick={() => {
                  setSelected(null);
                  setBooked(false);
                  setSelectedSlot(null);
                  setBookError(null);
                }}
                className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X />
              </button>

              {!booked ? (
                <>
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className="text-7xl w-32 h-32 glass-panel flex items-center justify-center bg-rose-400/5 shrink-0">
                      {selected.img}
                    </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h2 className="text-3xl font-bold">{selected.name}</h2>
                          <p className="text-lg text-rose-500 font-bold">{selected.specialty}</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selected.reviews > 0
                            ? `A verified specialist with ${selected.reviews} reviews and a ${selected.rating} rating. Specializes in ${selected.specialty.toLowerCase()}.`
                            : `Specializes in ${selected.specialty.toLowerCase()}. Ready to support your wellness journey.`}
                        </p>
                        <div className="flex gap-4 justify-center md:justify-start">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase">
                            <MapPin className="w-4 h-4 text-primary" /> Online Session
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Expert
                          </div>
                        </div>
                      </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Select a Time Slot</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Mon 10am', 'Tue 2pm', 'Wed 11am', 'Fri 4pm'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 rounded-2xl text-sm font-bold transition-all ${
                            selectedSlot === slot
                              ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                              : 'glass-panel hover:bg-rose-400/20 hover:text-rose-400 border-transparent'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {bookError && (
                    <p className="text-sm text-rose-500 font-bold">{bookError}</p>
                  )}
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">
                        Session Cost
                      </p>
                      <p className="text-2xl font-bold">{selected.price}</p>
                    </div>
                    <Button
                      size="lg"
                      className="px-12 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl h-16 disabled:opacity-40"
                      onClick={async () => {
                        setBookingLoading(true);
                        try {
                          const res = await fetch('/api/therapists/booking', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              therapistId: selected.id,
                              therapistName: selected.name,
                              date: selectedSlot!.split(' ')[0],
                              time: selectedSlot!.split(' ')[1],
                            }),
                          });
                          if (res.status === 409) {
                            setBookError('This slot is already booked. Please choose another.');
                            setBookingLoading(false);
                            return;
                          }
                          setBooked(true);
                        } catch {
                          setBookError('Failed to book. Please try again.');
                        } finally {
                          setBookingLoading(false);
                        }
                      }}
                      disabled={!selectedSlot || bookingLoading}
                    >
                      {bookingLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Booking...
                        </span>
                      ) : (
                        'Book Session'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">Session Requested!</h2>
                    <p className="text-muted-foreground">
                      Your session with {selected.name} on <strong>{selectedSlot}</strong> has been submitted. You will receive a confirmation email within 2 hours.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-14 px-8 rounded-2xl"
                    onClick={() => {
                      setSelected(null);
                      setBooked(false);
                      setSelectedSlot(null);
                    }}
                  >
                    Return to Directory
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
