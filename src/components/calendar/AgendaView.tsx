'use client';

import { useMemo } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AcademicCalendarEvent, AcademicEventType } from '@/lib/types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, PRIORITY_COLORS } from '@/lib/types';

interface AgendaViewProps {
  events: AcademicCalendarEvent[];
  onEventClick: (event: AcademicCalendarEvent) => void;
  filters: AcademicEventType[];
}

function getEventTime(event: AcademicCalendarEvent): string {
  if (event.allDay) return 'All day';
  if (event.startTime) {
    const end = event.endTime ? ` - ${event.endTime}` : '';
    return `${event.startTime}${end}`;
  }
  return format(new Date(event.startDate), 'h:mm a');
}

export default function AgendaView({ events, onEventClick, filters }: AgendaViewProps) {
  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => new Date(today.getTime() + 86400000), [today]);

  const grouped = useMemo(() => {
    const filtered =
      filters.length > 0 ? events.filter((e) => filters.includes(e.eventType)) : events;

    const active = filtered.filter((e) => e.status !== 'cancelled');

    const sorted = [...active].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const groups: { date: Date; label: string; events: AcademicCalendarEvent[] }[] = [];
    let currentGroup: { date: Date; label: string; events: AcademicCalendarEvent[] } | null = null;

    for (const event of sorted) {
      const eventDate = new Date(event.startDate);
      const label = isSameDay(eventDate, today)
        ? 'Today'
        : isSameDay(eventDate, tomorrow)
          ? 'Tomorrow'
          : format(eventDate, 'EEEE, MMMM d');

      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { date: eventDate, label, events: [] };
        groups.push(currentGroup);
      }
      currentGroup.events.push(event);
    }

    return groups;
  }, [events, filters, today, tomorrow]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-white/20"
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
        <h3 className="text-lg font-medium text-white/60 mb-1">No events found</h3>
        <p className="text-sm text-white/30">
          {filters.length > 0
            ? 'Try adjusting your filters'
            : 'Add your first event to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              {group.label}
            </h3>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-white/30">{group.events.length}</span>
          </div>

          <div className="space-y-2">
            {group.events.map((event) => {
              const typeColor = event.color || EVENT_TYPE_COLORS[event.eventType] || '#636e72';
              const priorityColor = PRIORITY_COLORS[event.priority];

              return (
                <button
                  key={event._id}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    'w-full text-left surface-interactive p-4 flex items-start gap-4',
                    event.priority === 'critical' && 'border-l-2',
                    event.priority === 'high' && 'border-l-2'
                  )}
                  style={{
                    borderLeftColor:
                      event.priority === 'critical' || event.priority === 'high'
                        ? priorityColor
                        : undefined,
                  }}
                >
                  <div
                    className="shrink-0 w-1 self-stretch rounded-full"
                    style={{ backgroundColor: typeColor }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-white truncate">{event.title}</h4>
                      <span
                        className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${priorityColor}20`,
                          color: priorityColor,
                        }}
                      >
                        {event.priority}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span
                        className="text-[11px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${typeColor}15`,
                          color: typeColor,
                        }}
                      >
                        {EVENT_TYPE_LABELS[event.eventType]}
                      </span>

                      <span className="text-[11px] text-white/40">{getEventTime(event)}</span>

                      {event.location && (
                        <span className="text-[11px] text-white/40 truncate">{event.location}</span>
                      )}
                    </div>

                    {event.course && (
                      <p className="text-[11px] text-white/30 mt-1">{event.course}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
