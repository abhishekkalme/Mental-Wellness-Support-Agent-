'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  CalendarDays,
  List,
  Search,
  X,
  Filter,
  Upload,
  RefreshCw,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import MonthView from '@/components/calendar/MonthView';
import WeekView from '@/components/calendar/WeekView';
import DayView from '@/components/calendar/DayView';
import AgendaView from '@/components/calendar/AgendaView';
import EventModal from '@/components/calendar/EventModal';
import ConflictPanel from '@/components/calendar/ConflictPanel';
import ImportModal from '@/components/calendar/ImportModal';
import AIInsightsPanel from '@/components/calendar/AIInsightsPanel';
import {
  startReminderService,
  stopReminderService,
  requestNotificationPermission,
  refreshReminders,
} from '@/lib/calendar/reminderService';
import type { AcademicCalendarEvent, AcademicEventType, CalendarView, Semester } from '@/lib/types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, PRIORITY_COLORS } from '@/lib/types';

const ALL_EVENT_TYPES: AcademicEventType[] = [
  'exam',
  'deadline',
  'lecture',
  'holiday',
  'assignment',
  'internal-assessment',
  'registration',
  'fee-deadline',
  'result',
  'faculty-event',
  'department-event',
  'office-hours',
  'study-group',
  'personal',
];

function getViewDateRange(currentDate: Date, view: CalendarView): { start: Date; end: Date } {
  if (view === 'day') {
    return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
  }
  if (view === 'week') {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return { start: weekStart, end: weekEnd };
  }
  if (view === 'month') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return {
      start: startOfWeek(monthStart, { weekStartsOn: 0 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    };
  }
  return {
    start: startOfMonth(currentDate),
    end: endOfMonth(addMonths(currentDate, 2)),
  };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export default function AcademicCalendarPage() {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicCalendarEvent | null>(null);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState<AcademicEventType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [optimisticEvents, setOptimisticEvents] = useState<AcademicCalendarEvent[] | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const fetchRef = useRef(0);

  const dateRange = useMemo(() => getViewDateRange(currentDate, view), [currentDate, view]);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('startDate', dateRange.start.toISOString());
    params.set('endDate', dateRange.end.toISOString());
    params.set('limit', '500');
    if (selectedSemester) params.set('semesterId', selectedSemester);
    if (searchQuery) params.set('search', searchQuery);
    return `/api/academic-calendar?${params}`;
  }, [dateRange, selectedSemester, searchQuery]);

  const fetchEvents = useCallback(async () => {
    const id = ++fetchRef.current;
    try {
      setLoading(true);
      setError(null);
      const [eventsRes, semestersRes] = await Promise.all([
        fetch(buildUrl()),
        fetch('/api/academic-calendar/semesters'),
      ]);
      if (id !== fetchRef.current) return;
      if (!eventsRes.ok) throw new Error('Failed to fetch events');
      const eventsData = await eventsRes.json();
      if (id !== fetchRef.current) return;
      const fetched = eventsData.data || [];
      setEvents(fetched);
      setOptimisticEvents(null);

      if (semestersRes.ok) {
        const semData = await semestersRes.json();
        if (id !== fetchRef.current) return;
        setSemesters(semData.data || []);
      }
    } catch (err) {
      if (id !== fetchRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to load calendar';
      setError(message);
      toast.error(message);
    } finally {
      if (id === fetchRef.current) setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length > 0 && view === 'day') {
      startReminderService(events, (e) => {
        toast(`Reminder: "${e.title}" is starting soon`, {
          icon: '🔔',
          duration: 8000,
        });
      });
    }
    return () => stopReminderService();
  }, [events, view]);

  useEffect(() => {
    function onReminder(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        toast(`Reminder: "${detail.title}" in ${detail.minutesBefore} min`, {
          icon: '🔔',
          duration: 8000,
        });
      }
    }
    window.addEventListener('calendar-reminder', onReminder);
    return () => window.removeEventListener('calendar-reminder', onReminder);
  }, []);

  useEffect(() => {
    if (optimisticEvents) {
      refreshReminders(optimisticEvents);
    }
  }, [optimisticEvents]);

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentDate((d) => {
        if (view === 'day') return direction === 'prev' ? subDays(d, 1) : addDays(d, 1);
        if (view === 'week') return direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1);
        return direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1);
      });
    },
    [view]
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    if (view === 'week') {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      setCurrentDate(weekStart);
    }
  }, [view]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleEventClick = useCallback((event: AcademicCalendarEvent) => {
    setEditingEvent(event);
    setModalDate(null);
    setModalOpen(true);
  }, []);

  const handleQuickAdd = useCallback(
    (date?: Date) => {
      requestNotificationPermission();
      setEditingEvent(null);
      setModalDate(date || selectedDate || new Date());
      setModalOpen(true);
    },
    [selectedDate]
  );

  const handleSave = useCallback(
    async (data: Partial<AcademicCalendarEvent>) => {
      const isEdit = !!data._id;
      const url = '/api/academic-calendar';
      const method = isEdit ? 'PATCH' : 'POST';

      const tempId = `temp-${Date.now()}`;
      const optimisticEvent: AcademicCalendarEvent = {
        _id: data._id || tempId,
        userId: '',
        title: data.title || '',
        eventType: data.eventType || 'personal',
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate,
        allDay: data.allDay ?? true,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        locationLink: data.locationLink,
        course: data.course,
        courseCode: data.courseCode,
        semesterId: data.semesterId,
        color: data.color,
        recurrence: data.recurrence || 'none',
        recurrenceEndDate: data.recurrenceEndDate,
        reminders: data.reminders || [],
        status: data.status || 'scheduled',
        priority: data.priority || 'medium',
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEdit) {
        setOptimisticEvents((prev) =>
          (prev || events).map((e) => (e._id === data._id ? { ...e, ...optimisticEvent } : e))
        );
      } else {
        setOptimisticEvents((prev) => [optimisticEvent, ...(prev || events)]);
      }

      setModalOpen(false);
      setEditingEvent(null);
      setModalDate(null);

      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEdit ? { id: data._id, ...data } : data),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || 'Failed to save event');
        }

        toast.success(isEdit ? 'Event updated' : 'Event created');
        await fetchEvents();
      } catch (err) {
        setOptimisticEvents(null);
        toast.error(err instanceof Error ? err.message : 'Failed to save');
        throw err;
      }
    },
    [events, fetchEvents]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setOptimisticEvents((prev) => (prev || events).filter((e) => e._id !== id));
      setModalOpen(false);
      setEditingEvent(null);

      try {
        const res = await fetch(`/api/academic-calendar?id=${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete event');
        toast.success('Event deleted');
        await fetchEvents();
      } catch {
        setOptimisticEvents(null);
        toast.error('Failed to delete');
      }
    },
    [events, fetchEvents]
  );

  const handleDragDrop = useCallback(
    async (eventId: string, newDate: Date, newStartTime: string) => {
      const event = events.find((e) => e._id === eventId);
      if (!event) return;

      setOptimisticEvents((prev) =>
        (prev || events).map((e) =>
          e._id === eventId
            ? { ...e, startDate: newDate.toISOString(), startTime: newStartTime }
            : e
        )
      );

      try {
        const res = await fetch('/api/academic-calendar', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: eventId,
            startDate: newDate.toISOString(),
            startTime: newStartTime,
          }),
        });

        if (!res.ok) throw new Error('Failed to move event');
        toast.success('Event moved');
        await fetchEvents();
      } catch {
        setOptimisticEvents(null);
        toast.error('Failed to move event');
      }
    },
    [events, fetchEvents]
  );

  const toggleFilter = useCallback((type: AcademicEventType) => {
    setFilters((prev) => (prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery('');
    setSelectedSemester('');
  }, []);

  const displayEvents = optimisticEvents || events;

  const stats = useMemo(() => {
    const now = new Date();
    const mStart = startOfMonth(now);
    const mEnd = endOfMonth(now);
    const monthEvents = displayEvents.filter((e) => {
      const d = new Date(e.startDate);
      return d >= mStart && d <= mEnd && e.status !== 'cancelled';
    });
    return {
      total: monthEvents.length,
      exams: monthEvents.filter((e) => e.eventType === 'exam').length,
      deadlines: monthEvents.filter(
        (e) => e.eventType === 'deadline' || e.eventType === 'assignment'
      ).length,
      highPriority: monthEvents.filter((e) => e.priority === 'high' || e.priority === 'critical')
        .length,
    };
  }, [displayEvents]);

  const activeSemester = useMemo(() => semesters.find((s) => s.isActive), [semesters]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      if (isInput) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(e.key === 'ArrowLeft' ? 'prev' : 'next');
      }
      if ((e.key === 't' || e.key === 'T') && !isInput) {
        e.preventDefault();
        goToToday();
      }
    },
    [navigate, goToToday]
  );

  const isFilterActive = filters.length > 0 || !!searchQuery || !!selectedSemester;

  return (
    <main
      id="main-content"
      ref={mainRef}
      className="max-w-7xl mx-auto p-4 md:p-8"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label="Academic Calendar"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-sm text-white/40 mt-1">
            {activeSemester
              ? `${activeSemester.name} · ${activeSemester.academicYear}`
              : 'Plan your semester'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="h-11 px-4 rounded-xl border border-white/[0.1] text-white/60 text-sm hover:bg-white/[0.06] transition-colors inline-flex items-center gap-2"
            aria-label="Import or export calendar data"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={() => handleQuickAdd()}
            className="h-11 px-5 rounded-xl bg-primary text-black font-medium text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            aria-label="Add new event"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-white/70 flex-1">{error}</p>
            <button
              onClick={fetchEvents}
              className="h-9 px-4 rounded-xl bg-white/[0.06] text-white/60 text-sm hover:bg-white/[0.1] transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'This Month', value: stats.total, color: '#E2FF6F' },
          { label: 'Exams', value: stats.exams, color: EVENT_TYPE_COLORS.exam },
          { label: 'Deadlines', value: stats.deadlines, color: EVENT_TYPE_COLORS.deadline },
          { label: 'High Priority', value: stats.highPriority, color: PRIORITY_COLORS.high },
        ].map((stat) => (
          <div key={stat.label} className="surface-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
            </div>
            <p className="text-2xl font-bold mt-1.5" style={{ color: stat.color }}>
              {loading ? '-' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <AIInsightsPanel />

      <div className="surface-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('prev')}
                className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-white/60" />
              </button>

              <button
                onClick={goToToday}
                className="h-9 px-3 rounded-xl border border-white/[0.1] text-xs font-medium text-white/60 hover:bg-white/[0.06] transition-colors"
              >
                Today
              </button>

              <button
                onClick={() => navigate('next')}
                className="w-9 h-9 rounded-xl hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-white/60" />
              </button>

              <h2 className="text-lg font-semibold ml-2" aria-live="polite">
                {view === 'day'
                  ? format(currentDate, 'EEEE, MMMM d')
                  : view === 'week'
                    ? `Week of ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')}`
                    : format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-40 lg:w-48 h-9 pl-9 pr-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/30 transition-colors"
                  aria-label="Search events"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 text-white/30" />
                  </button>
                )}
              </div>

              <div
                className="flex rounded-xl border border-white/[0.1] overflow-hidden"
                role="tablist"
                aria-label="Calendar view"
              >
                {[
                  { value: 'day' as CalendarView, icon: Calendar, label: 'Day view' },
                  { value: 'week' as CalendarView, icon: CalendarDays, label: 'Week view' },
                  { value: 'month' as CalendarView, icon: LayoutGrid, label: 'Month view' },
                  { value: 'agenda' as CalendarView, icon: List, label: 'Agenda view' },
                ].map(({ value: v, icon: Icon, label }) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center transition-colors',
                      view === v ? 'bg-primary text-black' : 'text-white/40 hover:bg-white/[0.06]'
                    )}
                    role="tab"
                    aria-selected={view === v}
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Filter className="w-3.5 h-3.5 text-white/30 mr-1" />
            {ALL_EVENT_TYPES.map((type) => {
              const active = filters.length === 0 || filters.includes(type);
              const color = EVENT_TYPE_COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={cn(
                    'text-[11px] px-2.5 py-1 rounded-lg border transition-colors',
                    active
                      ? 'border-white/[0.15] text-white/70'
                      : 'border-transparent text-white/20 hover:text-white/40'
                  )}
                  style={{
                    backgroundColor: active ? `${color}15` : 'transparent',
                    borderColor: active ? `${color}30` : 'transparent',
                  }}
                  aria-pressed={active}
                  aria-label={`Filter ${EVENT_TYPE_LABELS[type]} events`}
                >
                  {EVENT_TYPE_LABELS[type]}
                </button>
              );
            })}
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="text-[11px] px-2.5 py-1 rounded-lg text-white/30 hover:text-white/60 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CalendarSkeleton view={view} />
              </motion.div>
            ) : displayEvents.length === 0 && !isFilterActive ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CalendarEmptyState
                  onAdd={() => handleQuickAdd()}
                  onImport={() => setImportOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={view + currentDate.toISOString()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {view === 'day' && (
                  <DayView
                    currentDate={currentDate}
                    events={displayEvents}
                    onEventClick={handleEventClick}
                    filters={filters}
                  />
                )}
                {view === 'week' && (
                  <WeekView
                    currentDate={currentDate}
                    events={displayEvents}
                    onDateClick={handleDateClick}
                    onEventClick={handleEventClick}
                    onDropEvent={handleDragDrop}
                    filters={filters}
                  />
                )}
                {view === 'month' && (
                  <MonthView
                    currentDate={currentDate}
                    events={displayEvents}
                    selectedDate={selectedDate}
                    onDateClick={handleDateClick}
                    onEventClick={handleEventClick}
                    filters={filters}
                  />
                )}
                {view === 'agenda' && (
                  <AgendaView
                    events={displayEvents}
                    onEventClick={handleEventClick}
                    filters={filters}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
          setModalDate(null);
        }}
        onSave={handleSave}
        onDelete={editingEvent ? handleDelete : undefined}
        event={editingEvent}
        initialDate={modalDate}
        semesters={semesters}
      />

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={fetchEvents}
      />

      <ConflictPanel events={displayEvents} onEventClick={handleEventClick} />
    </main>
  );
}

function CalendarSkeleton({ view }: { view: CalendarView }) {
  return (
    <div className="animate-pulse" aria-label="Loading calendar">
      {view === 'month' ? (
        <div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-white/[0.04]" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
      ) : view === 'day' ? (
        <div className="space-y-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-16 h-16 rounded bg-white/[0.03]" />
              <div className="flex-1 h-16 rounded-xl bg-white/[0.03]" />
            </div>
          ))}
        </div>
      ) : view === 'week' ? (
        <div>
          <div className="grid grid-cols-8 gap-1 mb-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-white/[0.04]" />
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: 96 }).map((_, i) => (
              <div key={i} className="h-8 rounded bg-white/[0.02]" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 rounded bg-white/[0.04]" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="h-20 rounded-xl bg-white/[0.03]" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarEmptyState({ onAdd, onImport }: { onAdd: () => void; onImport: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-[28px] bg-white/[0.04] flex items-center justify-center mb-6">
        <CalendarDays className="w-10 h-10 text-white/15" />
      </div>
      <h3 className="text-xl font-semibold text-white/60 mb-2">Your calendar is empty</h3>
      <p className="text-sm text-white/30 max-w-md mb-8">
        Start planning your semester by adding exams, deadlines, lectures, and more. Stay organized
        and reduce academic stress.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onAdd}
          className="h-12 px-6 rounded-xl bg-primary text-black font-medium text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create first event
        </button>
        <button
          onClick={onImport}
          className="h-12 px-6 rounded-xl border border-white/[0.1] text-white/60 text-sm hover:bg-white/[0.06] transition-colors inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import from file
        </button>
      </div>
    </div>
  );
}
