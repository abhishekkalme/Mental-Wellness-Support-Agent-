'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Video,
  MessageSquare,
  Phone,
  User,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrencySymbol } from '@/lib/currency';

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<any>(null);
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [content, setContent] = useState('');
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [goals, setGoals] = useState('');
  const [progress, setProgress] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/therapists/sessions?role=therapist&limit=100');
        if (res.ok) {
          const data = await res.json();
          const s = data.sessions?.find((s: any) => s._id === id);
          setSession(s);
        }
        const noteRes = await fetch(`/api/therapists/notes?bookingId=${id}`);
        if (noteRes.ok) {
          const noteData = await noteRes.json();
          if (noteData.notes?.length > 0) {
            const n = noteData.notes[0];
            setNote(n);
            setContent(n.content || '');
            setMoodBefore(n.moodBefore || 5);
            setMoodAfter(n.moodAfter || 5);
            setGoals(n.goals?.join(', ') || '');
            setProgress(n.progress || '');
            setFollowUpDate(n.followUpDate ? n.followUpDate.split('T')[0] : '');
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const saveNote = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/therapists/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: id,
          content,
          moodBefore,
          moodAfter,
          goals: goals
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean),
          progress,
          followUpDate: followUpDate || null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30 font-bold">Session not found</p>
        <Link
          href="/therapist-admin/sessions"
          className="text-purple-400 text-sm mt-2 inline-block"
        >
          Back to sessions
        </Link>
      </div>
    );
  }

  const typeIcons: Record<string, React.ElementType> = {
    video: Video,
    chat: MessageSquare,
    phone: Phone,
  };
  const TypeIcon = typeIcons[session.type] || Video;

  return (
    <div className="space-y-8 max-w-3xl">
      <Link
        href="/therapist-admin/sessions"
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sessions
      </Link>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-xl font-bold text-purple-400">
            {session.userId?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{session.userId?.name || 'Client'}</h1>
            <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
              <span>
                {session.date} at {session.time}
              </span>
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{session.duration}min</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {session.amount > 0 && (
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">
                  {getCurrencySymbol(session.currency)}
                  {session.amount}
                </p>
                <p
                  className={`text-[10px] font-bold ${session.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}
                >
                  <CreditCard className="w-3 h-3 inline mr-0.5" />
                  {session.paymentStatus}
                </p>
              </div>
            )}
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize ${
                session.status === 'completed'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : session.status === 'confirmed'
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {session.status}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-md space-y-6">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Session Notes</h2>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Notes</label>
          <textarea
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 min-h-[200px] resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your session notes here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Mood Before (1-10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
              value={moodBefore}
              onChange={(e) => setMoodBefore(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
              Mood After (1-10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
              value={moodAfter}
              onChange={(e) => setMoodAfter(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Goals (comma-separated)
          </label>
          <input
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g. Reduce anxiety, Improve sleep, Practice mindfulness"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Progress Notes
          </label>
          <textarea
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 min-h-[80px] resize-y"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            placeholder="How did the client progress toward their goals?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
            Follow-up Date
          </label>
          <input
            type="date"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            {note?.aiSummary && <p className="text-[10px] text-white/30">AI summary available</p>}
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            <Button
              onClick={saveNote}
              disabled={saving}
              className="rounded-xl bg-purple-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-purple-600 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" /> Save Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
