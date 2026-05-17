'use client';

import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { AcademicCalendarEvent, AcademicEventType } from '@/lib/types';
import { EVENT_TYPE_COLORS, PRIORITY_COLORS } from '@/lib/types';

interface MonthViewProps {
  currentDate: Date;
  events: AcademicCalendarEvent[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: AcademicCalendarEvent) => void;
  filters: AcademicEventType[];
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getEventsForDay(events: AcademicCalendarEvent[], day: Date): AcademicCalendarEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.startDate);
    return isSameDay(eventDate, day) && event.status !== 'cancelled';
  });
}

function EventDot({ event }: { event: AcademicCalendarEvent }) {
  const color = event.color || EVENT_TYPE_COLORS[event.eventType] || '#636e72';
  const priorityColor = PRIORITY_COLORS[event.priority];

  return (
    <div
      className="flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:opacity-80 transition-opacity truncate max-w-full"
      style={{ backgroundColor: `${color}20` }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      title={`${event.title}${event.course ? ` (${event.course})` : ''}`}
    >
      <div className="shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] leading-tight truncate text-white/80">{event.title}</span>
    </div>
  );
}

export default function MonthView({
  currentDate,
  events,
  selectedDate,
  onDateClick,
  onEventClick,
  filters,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    if (filters.length === 0) return events;
    return events.filter((e) => filters.includes(e.eventType));
  }, [events, filters]);

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-white/40 py-2 tracking-wider uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-white/[0.06]">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(filteredEvents, day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onDateClick(day)}
              className={cn(
                'min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-white/[0.06] text-left transition-colors relative group',
                isCurrentMonth ? 'bg-transparent' : 'bg-white/[0.02]',
                isSelected && 'bg-primary/5',
                !isCurrentMonth && 'opacity-30'
              )}
            >
              <span
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm mb-1',
                  isTodayDate && 'bg-primary text-black font-bold',
                  !isTodayDate && 'text-white/70'
                )}
              >
                {format(day, 'd')}
              </span>

              <div className="flex flex-col gap-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <EventDot event={event} />
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-white/40 pl-1">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
