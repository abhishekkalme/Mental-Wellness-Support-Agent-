'use client';

import { useMemo } from 'react';
import { format, isToday, addHours, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AcademicCalendarEvent, AcademicEventType } from '@/lib/types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, TIME_SLOTS, HOUR_HEIGHT } from '@/lib/types';

interface DayViewProps {
  currentDate: Date;
  events: AcademicCalendarEvent[];
  onEventClick: (event: AcademicCalendarEvent) => void;
  filters: AcademicEventType[];
}

export default function DayView({ currentDate, events, onEventClick, filters }: DayViewProps) {
  const today = isToday(currentDate);

  const dayEvents = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);

    let filtered = events.filter((e) => {
      const d = new Date(e.startDate);
      return d >= dayStart && d <= dayEnd && e.status !== 'cancelled';
    });

    if (filters.length > 0) {
      filtered = filtered.filter((e) => filters.includes(e.eventType));
    }

    filtered.sort((a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });

    return filtered;
  }, [events, currentDate, filters]);

  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);

  const nowPosition = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return (hours - 7) * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
  }, []);

  return (
    <div className="select-none">
      {today && (
        <div className="text-xs text-primary font-medium mb-4">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
      )}

      <div className="text-center py-6 border-b border-white/[0.06] mb-4">
        <div className="text-sm text-white/40 uppercase tracking-wider">
          {format(currentDate, 'EEEE')}
        </div>
        <div
          className={cn(
            'inline-flex items-center justify-center w-14 h-14 rounded-full text-2xl font-bold mt-1',
            today && 'bg-primary text-black',
            !today && 'text-white/70'
          )}
        >
          {format(currentDate, 'd')}
        </div>
      </div>

      {allDayEvents.length > 0 && (
        <div className="mb-4 space-y-1">
          <div className="text-[10px] text-white/30 uppercase tracking-wider px-1 mb-2">
            All Day
          </div>
          {allDayEvents.map((event) => {
            const color = event.color || EVENT_TYPE_COLORS[event.eventType] || '#636e72';
            return (
              <button
                key={event._id}
                onClick={() => onEventClick(event)}
                className="w-full text-left rounded-lg px-3 py-2 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: `${color}20` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-white truncate">{event.title}</span>
                  <span className="text-[10px] text-white/40 ml-auto shrink-0">
                    {EVENT_TYPE_LABELS[event.eventType]}
                  </span>
                </div>
                {event.course && (
                  <p className="text-xs text-white/30 mt-0.5 ml-4">{event.course}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative">
        {TIME_SLOTS.map((slot) => (
          <div key={slot.hour} className="flex h-16 border-b border-white/[0.04]">
            <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-0">
              <span className="text-[10px] text-white/30 -mt-2">{slot.label}</span>
            </div>
            <div className="flex-1 relative">
              {timedEvents
                .filter((e) => {
                  if (!e.startTime) return false;
                  const [eh] = e.startTime.split(':').map(Number);
                  return eh === slot.hour;
                })
                .map((event) => {
                  const color = event.color || EVENT_TYPE_COLORS[event.eventType] || '#636e72';
                  return (
                    <button
                      key={event._id}
                      onClick={() => onEventClick(event)}
                      className="absolute inset-x-1 top-0.5 rounded-lg px-3 py-2 text-left cursor-pointer hover:opacity-80 transition-opacity z-10 overflow-hidden"
                      style={{
                        backgroundColor: `${color}20`,
                        borderLeft: `3px solid ${color}`,
                      }}
                    >
                      <div className="text-sm font-medium text-white truncate">{event.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/40">
                          {event.startTime}
                          {event.endTime ? ` - ${event.endTime}` : ''}
                        </span>
                        {event.location && (
                          <span className="text-[10px] text-white/30 truncate">
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.course && (
                        <div className="text-[10px] text-white/30 mt-0.5">{event.course}</div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}

        {today && nowPosition > 0 && nowPosition < TIME_SLOTS.length * HOUR_HEIGHT && (
          <div
            className="absolute left-16 right-0 pointer-events-none z-20"
            style={{ top: `${nowPosition}px` }}
          >
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="flex-1 h-px bg-primary" />
            </div>
          </div>
        )}
      </div>

      {dayEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-white/40">No events on this day</p>
        </div>
      )}
    </div>
  );
}
