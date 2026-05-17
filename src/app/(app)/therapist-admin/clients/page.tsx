'use client';

import { useEffect, useState } from 'react';
import { Users, Search, MessageSquare, CalendarCheck, User } from 'lucide-react';
import Link from 'next/link';
import { getCurrencySymbol } from '@/lib/currency';

interface ClientSummary {
  _id: string;
  name: string;
  email: string;
  image?: string;
  sessionCount: number;
  lastSessionDate: string;
  totalSpent: number;
  currency: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/therapists/sessions?role=therapist&limit=200');
        if (res.ok) {
          const data = await res.json();
          const sessions = data.sessions || [];

          const clientMap = new Map<string, ClientSummary>();
          for (const s of sessions) {
            const uid = s.userId?._id || 'unknown';
            if (!clientMap.has(uid)) {
              clientMap.set(uid, {
                _id: uid,
                name: s.userId?.name || 'Unknown Client',
                email: s.userId?.email || '',
                image: s.userId?.image,
                sessionCount: 0,
                lastSessionDate: s.date,
                totalSpent: 0,
                currency: s.currency || 'USD',
              });
            }
            const client = clientMap.get(uid)!;
            client.sessionCount++;
            if (s.date > client.lastSessionDate) client.lastSessionDate = s.date;
            if (s.amount) client.totalSpent += s.amount;
          }

          setClients(
            Array.from(clientMap.values()).sort((a, b) => b.sessionCount - a.sessionCount)
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : clients;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Users className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients</h1>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.15em]">
            Your client roster
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white outline-none focus:border-purple-500/50 placeholder-white/20"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center backdrop-blur-md">
          <Users className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/30 font-bold">No clients yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <div
              key={client._id}
              className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-md hover:border-purple-500/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-lg font-bold text-purple-400 shrink-0 overflow-hidden">
                  {client.image ? (
                    <img src={client.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    client.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{client.name}</p>
                  <p className="text-xs text-white/40">{client.email}</p>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-lg font-bold text-white">{client.sessionCount}</p>
                    <p className="text-[10px] text-white/40 uppercase">Sessions</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/80">
                      {client.lastSessionDate || 'N/A'}
                    </p>
                    <p className="text-[10px] text-white/40 uppercase">Last Session</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">
                      {getCurrencySymbol(client.currency)}
                      {client.totalSpent}
                    </p>
                    <p className="text-[10px] text-white/40 uppercase">Total</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
