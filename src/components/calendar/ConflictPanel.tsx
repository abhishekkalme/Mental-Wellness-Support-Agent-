'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import type { ConflictAlert, AcademicCalendarEvent } from '@/lib/types';
import { EVENT_TYPE_COLORS } from '@/lib/types';

interface ConflictPanelProps {
  events: AcademicCalendarEvent[];
  onEventClick: (event: AcademicCalendarEvent) => void;
}

function detectConflicts(events: AcademicCalendarEvent[]): ConflictAlert[] {
  const conflicts: ConflictAlert[] = [];
  const active = events.filter((e) => e.status !== 'cancelled' && !e.allDay);

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];

      if (!isSameDay(new Date(a.startDate), new Date(b.startDate))) continue;
      if (!a.startTime || !b.startTime) continue;

      const aStart = a.startTime;
      const aEnd = a.endTime || a.startTime;
      const bStart = b.startTime;
      const bEnd = b.endTime || b.startTime;

      if (aStart < bEnd && bStart < aEnd) {
        conflicts.push({
          event1: a,
          event2: b,
          type: 'time-overlap',
          description: `"${a.title}" overlaps with "${b.title}" on ${format(new Date(a.startDate), 'MMM d')}`,
        });
      }
    }
  }

  const examEvents = active.filter((e) => e.eventType === 'exam');
  for (let i = 0; i < examEvents.length; i++) {
    for (let j = i + 1; j < examEvents.length; j++) {
      if (isSameDay(new Date(examEvents[i].startDate), new Date(examEvents[j].startDate))) {
        conflicts.push({
          event1: examEvents[i],
          event2: examEvents[j],
          type: 'same-day-exam',
          description: `Two exams on the same day: "${examEvents[i].title}" and "${examEvents[j].title}" on ${format(new Date(examEvents[i].startDate), 'MMM d')}`,
        });
      }
    }
  }

  return conflicts;
}

export default function ConflictPanel({ events, onEventClick }: ConflictPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const conflicts = detectConflicts(events);

  if (conflicts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-destructive text-white shadow-lg flex items-center justify-center hover:bg-destructive/90 transition-colors relative"
        aria-label={`${conflicts.length} schedule conflicts detected`}
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-destructive text-[10px] font-bold flex items-center justify-center">
          {conflicts.length}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 right-0 w-80 surface-card p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Schedule Conflicts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded hover:bg-white/[0.06] flex items-center justify-center"
              >
                <svg
                  className="w-3 h-3 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scroll">
              {conflicts.map((conflict, idx) => {
                const color = EVENT_TYPE_COLORS[conflict.event1.eventType];
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-destructive/5 border border-destructive/10"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/70">{conflict.description}</p>
                        <div className="flex gap-2 mt-1.5">
                          <button
                            onClick={() => onEventClick(conflict.event1)}
                            className="text-[10px] px-2 py-0.5 rounded hover:bg-white/[0.06] transition-colors"
                            style={{ color }}
                          >
                            {conflict.event1.title}
                          </button>
                          <span className="text-[10px] text-white/30">vs</span>
                          <button
                            onClick={() => onEventClick(conflict.event2)}
                            className="text-[10px] px-2 py-0.5 rounded hover:bg-white/[0.06] transition-colors"
                            style={{ color }}
                          >
                            {conflict.event2.title}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
