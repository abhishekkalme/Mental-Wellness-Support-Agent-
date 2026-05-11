'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AcademicEvent } from '@/lib/types';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  Bookmark,
  Bell,
  ArrowRight,
  TrendingDown,
  Loader2,
  Database,
} from 'lucide-react';

const initialEvents = [
  {
    id: 'e1',
    title: 'CS301 Final Exam',
    date: '2026-05-15',
    type: 'exam',
    course: 'Computer Science',
    location: 'Hall A',
  },
  {
    id: 'e2',
    title: 'Psychology Essay Draft',
    date: '2026-05-08',
    type: 'deadline',
    course: 'Psychology',
    location: 'Online',
  },
  {
    id: 'e3',
    title: 'Math Workshop',
    date: '2026-05-03',
    type: 'lecture',
    course: 'Mathematics',
    location: 'Room 102',
  },
  {
    id: 'e4',
    title: 'Biology Lab Report',
    date: '2026-05-05',
    type: 'deadline',
    course: 'Biology',
    location: 'Lab 4',
  },
];

export default function AcademicCalendarPage() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/academic-calendar');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/academic-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialEvents),
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents =
    activeFilter === 'All'
      ? events
      : events.filter((e) => {
          if (activeFilter === 'Exams') return e.type === 'exam';
          if (activeFilter === 'Deadlines') return e.type === 'deadline';
          if (activeFilter === 'Lectures') return e.type === 'lecture';
          return true;
        });

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-amber-500">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="font-bold tracking-widest uppercase text-xs">Syncing Calendar...</p>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Calendar className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Academic Sync</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Academic Flow</h1>
          <p className="text-muted-foreground text-lg">
            Stay ahead of deadlines and manage exam stress proactively.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Bookmark className="w-4 h-4" /> Import iCal
          </Button>
          <Button className="gap-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-8 bg-amber-500/5 border-amber-500/20 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2 text-amber-500">
              <Bell className="w-5 h-5" /> Stress Alerts
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                <div className="flex items-center gap-2 text-orange-500 font-bold text-[10px] uppercase">
                  <AlertTriangle className="w-3.5 h-3.5" /> High Load Detected
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  You have several tasks approaching. We&apos;ve optimized your schedule for peak
                  performance.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 space-y-4">
            <h3 className="font-bold text-lg">Focus Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Upcoming Events</span>
                <span className="font-bold">{events.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Exams', 'Deadlines', 'Lectures'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  activeFilter === f
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'glass-panel text-muted-foreground hover:border-amber-500/30'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {events.length === 0 ? (
            <div className="glass-panel p-20 text-center flex flex-col items-center justify-center border-amber-500/10 bg-amber-500/5 shadow-2xl relative overflow-hidden rounded-[40px]">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-30" />
              <div className="w-24 h-24 rounded-[32px] bg-amber-500/10 text-amber-500 flex items-center justify-center mb-8 shadow-xl shadow-amber-500/5 relative z-10">
                <Database className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white relative z-10 tracking-tight">
                Calendar Empty
              </h2>
              <p className="text-white/40 max-w-lg mx-auto text-lg font-medium leading-relaxed relative z-10 mb-10">
                No academic events synchronized. Connect your university account or initialize with
                sample schedule data.
              </p>
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="h-16 px-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg relative z-10 shadow-2xl shadow-amber-500/20"
              >
                {isSeeding ? (
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                ) : (
                  <Plus className="w-6 h-6 mr-2" />
                )}
                Initialize Schedule
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass-panel p-8 space-y-6 group hover:border-amber-500/20 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        event.type === 'exam'
                          ? 'bg-rose-500/10 text-rose-500'
                          : event.type === 'deadline'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {event.type}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.course} • {event.location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Clock className="w-4 h-4" /> {event.date}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-500 group-hover:bg-amber-500 group-hover:text-white rounded-full"
                    >
                      View Details <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {events.length > 0 && (
            <div className="glass-panel p-12 text-center border-dashed border-2 bg-secondary/10 border-border/50 space-y-4">
              <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground italic">
                Maintaining balance is key during high-load weeks. Great job staying organized!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
