'use client';

import { useState, useMemo, useRef } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AcademicCalendarEvent, AcademicEventType } from '@/lib/types';
import { EVENT_TYPE_COLORS, TIME_SLOTS, HOUR_HEIGHT, getEventPosition } from '@/lib/types';

interface WeekViewProps {
  currentDate: Date;
  events: AcademicCalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: AcademicCalendarEvent) => void;
  onDropEvent?: (eventId: string, newDate: Date, newStartTime: string) => void;
  filters: AcademicEventType[];
}

export default function WeekView({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  onDropEvent,
  filters,
}: WeekViewProps) {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    if (filters.length === 0) return events;
    return events.filter((e) => filters.includes(e.eventType) && e.status !== 'cancelled');
  }, [events, filters]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AcademicCalendarEvent[]>();
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      map.set(key, []);
    }
    for (const event of filteredEvents) {
      const eventDate = new Date(event.startDate);
      const key = format(eventDate, 'yyyy-MM-dd');
      if (map.has(key)) {
        map.get(key)!.push(event);
      }
    }
    for (const [, dayEvents] of map) {
      dayEvents.sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
      });
    }
    return map;
  }, [filteredEvents, days]);

  const gridRef = useRef<HTMLDivElement>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);

  return (
    <div className="select-none">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/[0.06]">
        <div className="p-2" />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick(day)}
              className={cn(
                'p-2 text-center transition-colors hover:bg-white/[0.04]',
                today && 'bg-primary/5'
              )}
            >
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                {format(day, 'EEE')}
              </div>
              <div
                className={cn(
                  'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm mt-0.5',
                  today && 'bg-primary text-black font-bold',
                  !today && 'text-white/70'
                )}
              >
                {format(day, 'd')}
              </div>
            </button>
          );
        })}
      </div>

      <div
        ref={gridRef}
        className="grid grid-cols-[60px_repeat(7,1fr)] overflow-auto max-h-[600px] custom-scroll relative"
      >
        {TIME_SLOTS.map((slot) => (
          <div key={slot.hour} className="contents">
            <div className="relative h-16 border-b border-white/[0.04] pr-2 text-right">
              <span className="absolute -top-2 right-2 text-[10px] text-white/30">
                {slot.label}
              </span>
            </div>
            {days.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDay.get(dayKey) || [];
              const slotEvents = dayEvents.filter((e) => {
                if (e.allDay) return false;
                if (!e.startTime) return false;
                const [eh] = e.startTime.split(':').map(Number);
                return eh === slot.hour;
              });

              return (
                <div
                  key={`${dayKey}-${slot.hour}`}
                  className={cn(
                    'relative h-16 border-b border-r border-white/[0.04] transition-colors',
                    dragOverDay === dayKey && 'bg-primary/5'
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDay(dayKey);
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const eventId = e.dataTransfer.getData('text/event-id');
                    if (eventId && onDropEvent) {
                      const timeStr = `${String(slot.hour).padStart(2, '0')}:00`;
                      onDropEvent(eventId, day, timeStr);
                    }
                    setDragOverDay(null);
                  }}
                >
                  {slotEvents.map((event) => {
                    const color = event.color || EVENT_TYPE_COLORS[event.eventType] || '#636e72';
                    return (
                      <button
                        key={event._id}
                        draggable={!!onDropEvent}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/event-id', event._id);
                        }}
                        onClick={() => onEventClick(event)}
                        className="absolute inset-x-0.5 top-0.5 rounded-md px-1.5 py-1 text-left cursor-pointer hover:opacity-80 transition-opacity z-10 overflow-hidden"
                        style={{
                          backgroundColor: `${color}25`,
                          borderLeft: `3px solid ${color}`,
                        }}
                      >
                        <div className="text-[11px] font-medium text-white truncate">
                          {event.title}
                        </div>
                        {event.course && (
                          <div className="text-[9px] text-white/40 truncate">{event.course}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
