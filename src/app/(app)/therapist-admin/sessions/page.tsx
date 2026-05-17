'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Video,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getCurrencySymbol } from '@/lib/currency';

interface Session {
  _id: string;
  userId?: { _id: string; name: string; email: string; image?: string };
  date: string;
  time: string;
  type: 'chat' | 'video' | 'phone';
  status: string;
  duration: number;
  amount: number;
  currency: string;
  createdAt: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('role', 'therapist');
      params.set('limit', '50');
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/therapists/sessions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      await fetch('/api/therapists/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status }),
      });
      fetchSessions();
    } catch {
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColors: Record<string, string> = {
    confirmed: 'bg-purple-500/10 text-purple-400',
    completed: 'bg-emerald-500/10 text-emerald-400',
    cancelled: 'bg-rose-500/10 text-rose-400',
    'no-show': 'bg-amber-500/10 text-amber-400',
    'in-progress': 'bg-sky-500/10 text-sky-400',
  };

  const typeIcons: Record<string, React.ElementType> = {
    video: Video,
    chat: MessageSquare,
    phone: Phone,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <CalendarCheck className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sessions</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Manage and track all sessions
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'text-white/40 hover:text-white/80 bg-white/5 border border-transparent'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center backdrop-blur-md">
          <CalendarCheck className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/30 font-bold">No sessions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const TypeIcon = typeIcons[s.type] || Video;
            const StatusIcon =
              s.status === 'completed' ? CheckCircle2 : s.status === 'cancelled' ? XCircle : Clock;
            return (
              <div
                key={s._id}
                className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md hover:border-purple-500/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-sm font-bold text-purple-400 shrink-0">
                      {s.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{s.userId?.name || 'Client'}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${statusColors[s.status] || 'bg-white/5 text-white/40'}`}
                        >
                          <StatusIcon className="w-3 h-3" /> {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                        <span>
                          {s.date} at {s.time}
                        </span>
                        <TypeIcon className="w-3.5 h-3.5" />
                        <span>{s.duration}min</span>
                        {s.amount > 0 && (
                          <span>
                            {getCurrencySymbol(s.currency)}
                            {s.amount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {s.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatus(s._id, 'in-progress')}
                          disabled={updatingId === s._id}
                          className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all disabled:opacity-50"
                          title="Start session"
                        >
                          {updatingId === s._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => updateStatus(s._id, 'completed')}
                          disabled={updatingId === s._id}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          title="Complete"
                        >
                          {updatingId === s._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    )}
                    {s.status === 'in-progress' && (
                      <button
                        onClick={() => updateStatus(s._id, 'completed')}
                        disabled={updatingId === s._id}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                        title="Complete session"
                      >
                        {updatingId === s._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <Link
                      href={`/therapist-admin/sessions/${s._id}`}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all"
                      title="View details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
