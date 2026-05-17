'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarCheck,
  Video,
  MessageSquare,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { getCurrencySymbol } from '@/lib/currency';
import toast from 'react-hot-toast';

interface Session {
  _id: string;
  therapistId: string;
  therapistProfileId?: string;
  therapistName: string;
  date: string;
  time: string;
  type: 'chat' | 'video' | 'phone';
  status: string;
  duration: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
}

function PaymentBanner() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);
  const payment = searchParams.get('payment');
  if (!payment || !visible) return null;
  return (
    <div
      className={`p-4 rounded-2xl border flex items-center gap-3 ${payment === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}
    >
      {payment === 'success' ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" />
      )}
      <p className="text-sm font-bold flex-1">
        {payment === 'success'
          ? 'Payment successful! Your session is confirmed.'
          : 'Payment cancelled. Your session is booked but unpaid.'}
      </p>
      <button onClick={() => setVisible(false)} className="text-xs opacity-60 hover:opacity-100">
        &times;
      </button>
    </div>
  );
}

function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const searchParams = useSearchParams();

  const dedupe = (list: Session[]) => {
    const seen = new Set<string>();
    return list.filter((s) => {
      if (seen.has(s._id)) return false;
      seen.add(s._id);
      return true;
    });
  };

  const loadSessions = () => {
    setLoading(true);
    fetch('/api/therapists/sessions?limit=100')
      .then((r) => (r.ok ? r.json() : { sessions: [] }))
      .then((d) => setSessions(dedupe(d.sessions || [])))
      .catch(() => toast.error('Failed to load sessions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const res = await fetch('/api/therapists/sessions?limit=100');
        const data = await res.json();
        setSessions(dedupe(data.sessions || []));
        const all = dedupe(data.sessions || []).filter((x: Session) => x.status === 'confirmed');
        const paid = all.every((x: Session) => x.paymentStatus === 'paid');
        if (paid || attempts >= 6) clearInterval(poll);
      }, 2000);
      return () => clearInterval(poll);
    }
  }, [searchParams]);

  const typeIcons: Record<string, React.ElementType> = {
    video: Video,
    chat: MessageSquare,
    phone: Phone,
  };
  const statusColors: Record<string, string> = {
    confirmed: 'bg-purple-500/10 text-purple-400',
    completed: 'bg-emerald-500/10 text-emerald-400',
    cancelled: 'bg-rose-500/10 text-rose-400',
    'no-show': 'bg-amber-500/10 text-amber-400',
    'in-progress': 'bg-sky-500/10 text-sky-400',
  };
  const paymentColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400',
    paid: 'bg-emerald-500/10 text-emerald-400',
    refunded: 'bg-rose-500/10 text-rose-400',
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this session?')) return;
    try {
      const res = await fetch(`/api/therapists/booking?id=${id}&mode=cancel`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Session cancelled');
        setSessions((prev) => prev.map((s) => (s._id === id ? { ...s, status: 'cancelled' } : s)));
      } else {
        toast.error('Failed to cancel session');
      }
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Permanently delete this session from history?')) return;
    try {
      const res = await fetch(`/api/therapists/booking?id=${id}&mode=hard`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Session deleted');
        setSessions((prev) => prev.filter((s) => s._id !== id));
      } else {
        toast.error('Failed to delete session');
      }
    } catch {
      toast.error('Failed to delete session');
    }
  };

  const deduped = dedupe(sessions);
  const filtered = filter ? deduped.filter((s) => s.status === filter) : deduped;
  const upcoming = deduped.filter((s) => s.status === 'confirmed');
  const past = deduped.filter((s) => s.status !== 'confirmed');

  const groupByMonth = (list: Session[]) => {
    const groups: Record<string, Session[]> = {};
    for (const s of list) {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <Link
        href="/therapists"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      <PaymentBanner />

      <div className="flex items-center gap-3 text-purple-400 mb-2">
        <CalendarCheck className="w-6 h-6" />
        <h1 className="text-3xl font-bold">My Sessions</h1>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <span
          className={`text-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer ${!filter ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/60'}`}
          onClick={() => setFilter('')}
        >
          All ({deduped.length})
        </span>
        <span
          className={`text-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer ${filter === 'confirmed' ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/60'}`}
          onClick={() => setFilter(filter === 'confirmed' ? '' : 'confirmed')}
        >
          Upcoming ({sessions.filter((s) => s.status === 'confirmed').length})
        </span>
        <span
          className={`text-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer ${filter === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/60'}`}
          onClick={() => setFilter(filter === 'completed' ? '' : 'completed')}
        >
          Completed
        </span>
        <span
          className={`text-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer ${filter === 'cancelled' ? 'bg-rose-500/20 text-rose-400' : 'text-white/40 hover:text-white/60'}`}
          onClick={() => setFilter(filter === 'cancelled' ? '' : 'cancelled')}
        >
          Cancelled
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <CalendarCheck className="w-12 h-12 mx-auto text-white/20" />
          <p className="text-white/30 font-bold text-lg">No sessions found</p>
          <p className="text-white/20 text-sm">
            {filter ? `No ${filter} sessions yet` : 'Book your first session to get started'}
          </p>
          <Link href="/therapists">
            <button className="mt-2 px-6 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-sm hover:bg-purple-500/20 transition-all">
              Browse Therapists
            </button>
          </Link>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && !filter && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> Upcoming Sessions ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((s) => {
                  const TypeIcon = typeIcons[s.type] || Video;
                  return (
                    <div
                      key={s._id}
                      className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-purple-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{s.therapistName}</p>
                          <p className="text-sm text-white/50">
                            {new Date(s.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            at {s.time} · {s.duration}min
                          </p>
                          {s.amount > 0 && (
                            <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                              <CreditCard className="w-3 h-3" /> {getCurrencySymbol(s.currency)}
                              {s.amount}
                              <span
                                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${paymentColors[s.paymentStatus] || ''}`}
                              >
                                {s.paymentStatus}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.paymentStatus === 'paid' ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-500/10 text-amber-400">
                            Pending
                          </span>
                        )}
                        <button
                          onClick={() => cancelBooking(s._id)}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className={!filter && upcoming.length > 0 ? 'border-t border-white/10 pt-8 mt-4' : ''}
          >
            {!filter && past.length > 0 && (
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-white/40" /> Session History ({past.length})
              </h2>
            )}
            <div className="space-y-6">
              {groupByMonth(filter ? filtered : past).map(([monthKey, monthSessions]) => {
                const [year, month] = monthKey.split('-');
                return (
                  <div key={monthKey}>
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-wider mb-3">
                      {MONTH_NAMES[parseInt(month) - 1]} {year}
                    </h3>
                    <div className="space-y-2">
                      {monthSessions.map((s) => {
                        const TypeIcon = typeIcons[s.type] || Video;
                        return (
                          <div
                            key={s._id}
                            className="glass-panel p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <TypeIcon className="w-4 h-4 text-white/30 shrink-0" />
                              <div>
                                <p className="text-sm font-bold text-white/80">{s.therapistName}</p>
                                <p className="text-xs text-white/40">
                                  {new Date(s.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}{' '}
                                  at {s.time} · {s.duration}min
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {s.amount > 0 && (
                                <span className="text-xs text-white/40 mr-1">
                                  {getCurrencySymbol(s.currency)}
                                  {s.amount}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusColors[s.status] || 'bg-white/5 text-white/40'}`}
                              >
                                {s.status}
                              </span>
                              <Link
                                href={`/therapists/${s.therapistProfileId || s.therapistId}`}
                                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold ml-1"
                              >
                                Book Again
                              </Link>
                              {s.status === 'cancelled' && (
                                <button
                                  onClick={() => deleteBooking(s._id)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold ml-1"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default function UserSessionsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-4 md:p-8 max-w-4xl mx-auto">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </main>
      }
    >
      <SessionsList />
    </Suspense>
  );
}
