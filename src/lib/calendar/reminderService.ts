import type { AcademicCalendarEvent } from '@/lib/types';

interface PendingReminder {
  eventId: string;
  title: string;
  minutesBefore: number;
  triggerAt: number;
  fired: boolean;
}

let pendingReminders: PendingReminder[] = [];
let checkInterval: ReturnType<typeof setInterval> | null = null;
let onReminderCallback: ((event: AcademicCalendarEvent) => void) | null = null;

export function startReminderService(
  events: AcademicCalendarEvent[],
  onReminder: (event: AcademicCalendarEvent) => void
) {
  onReminderCallback = onReminder;
  refreshReminders(events);

  if (!checkInterval) {
    checkInterval = setInterval(checkReminders, 30000);
  }
}

export function stopReminderService() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  pendingReminders = [];
}

export function refreshReminders(events: AcademicCalendarEvent[]) {
  const now = Date.now();

  pendingReminders = [];

  for (const event of events) {
    if (event.status === 'cancelled') continue;

    const eventTime = new Date(event.startDate).getTime();
    if (eventTime < now) continue;

    for (const reminder of event.reminders) {
      const triggerAt = eventTime - reminder.time * 60 * 1000;
      if (triggerAt > now) {
        pendingReminders.push({
          eventId: event._id,
          title: event.title,
          minutesBefore: reminder.time,
          triggerAt,
          fired: false,
        });
      }
    }
  }

  if (events.length > 0 && events[0].reminders.length === 0) {
    const defaultMinutes = [30, 60, 1440];
    for (const event of events) {
      if (event.status === 'cancelled') continue;
      const eventTime = new Date(event.startDate).getTime();
      if (eventTime < now) continue;

      for (const min of defaultMinutes) {
        const triggerAt = eventTime - min * 60 * 1000;
        if (triggerAt > now) {
          pendingReminders.push({
            eventId: event._id,
            title: event.title,
            minutesBefore: min,
            triggerAt,
            fired: false,
          });
        }
      }
    }
  }
}

function checkReminders() {
  const now = Date.now();

  for (const reminder of pendingReminders) {
    if (!reminder.fired && reminder.triggerAt <= now) {
      reminder.fired = true;
      triggerNotification(reminder);
    }
  }
}

function triggerNotification(reminder: PendingReminder) {
  const timeLabel = formatReminderTime(reminder.minutesBefore);

  if (onReminderCallback) {
    onReminderCallback({
      _id: reminder.eventId,
      title: reminder.title,
    } as AcademicCalendarEvent);
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Academic Calendar', {
      body: `"${reminder.title}" starts in ${timeLabel}`,
      icon: '/favicon.ico',
    });
  }

  if (typeof window !== 'undefined') {
    const detail = {
      eventId: reminder.eventId,
      title: reminder.title,
      minutesBefore: reminder.minutesBefore,
    };
    window.dispatchEvent(new CustomEvent('calendar-reminder', { detail }));
  }
}

function formatReminderTime(minutes: number): string {
  if (minutes <= 0) return 'starting now';
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function getPendingCount(): number {
  return pendingReminders.filter((r) => !r.fired).length;
}
