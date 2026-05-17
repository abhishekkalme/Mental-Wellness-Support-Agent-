export type AcademicEventType =
  | 'exam'
  | 'deadline'
  | 'lecture'
  | 'holiday'
  | 'assignment'
  | 'internal-assessment'
  | 'registration'
  | 'fee-deadline'
  | 'result'
  | 'faculty-event'
  | 'department-event'
  | 'office-hours'
  | 'study-group'
  | 'personal';

export type EventStatus = 'scheduled' | 'cancelled' | 'rescheduled';
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface AcademicCalendarEvent {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  eventType: AcademicEventType;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  location?: string;
  locationLink?: string;
  course?: string;
  courseCode?: string;
  semesterId?: string;
  color?: string;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string;
  reminders: { time: number; type: 'notification' | 'email' }[];
  status: EventStatus;
  priority: EventPriority;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Semester {
  _id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  institution?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

export const EVENT_TYPE_COLORS: Record<AcademicEventType, string> = {
  exam: '#ff6b6b',
  deadline: '#ffa94d',
  lecture: '#4ecdc4',
  holiday: '#ffd93d',
  assignment: '#6c5ce7',
  'internal-assessment': '#a29bfe',
  registration: '#00b894',
  'fee-deadline': '#e17055',
  result: '#fd79a8',
  'faculty-event': '#0984e3',
  'department-event': '#636e72',
  'office-hours': '#74b9ff',
  'study-group': '#00cec9',
  personal: '#ffeaa7',
};

export const EVENT_TYPE_LABELS: Record<AcademicEventType, string> = {
  exam: 'Exam',
  deadline: 'Deadline',
  lecture: 'Lecture',
  holiday: 'Holiday',
  assignment: 'Assignment',
  'internal-assessment': 'Assessment',
  registration: 'Registration',
  'fee-deadline': 'Fee Deadline',
  result: 'Result',
  'faculty-event': 'Faculty Event',
  'department-event': 'Dept Event',
  'office-hours': 'Office Hours',
  'study-group': 'Study Group',
  personal: 'Personal',
};

export const PRIORITY_COLORS: Record<EventPriority, string> = {
  low: '#636e72',
  medium: '#74b9ff',
  high: '#ffa94d',
  critical: '#ff6b6b',
};

export interface ConflictAlert {
  event1: AcademicCalendarEvent;
  event2: AcademicCalendarEvent;
  type: 'time-overlap' | 'same-day-exam' | 'back-to-back';
  description: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: { row: number; error: string }[];
  total: number;
}

export type TimeSlot = {
  hour: number;
  label: string;
};

export const TIME_SLOTS: TimeSlot[] = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 7;
  const label = hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
  return { hour, label: hour === 12 ? '12 PM' : label };
});

export const HOUR_HEIGHT = 64;

export function getEventPosition(
  startTime: string,
  endTime?: string
): { top: number; height: number } {
  const [sh, sm] = startTime.split(':').map(Number);
  const top = (sh - 7) * HOUR_HEIGHT + (sm / 60) * HOUR_HEIGHT;
  if (endTime) {
    const [eh, em] = endTime.split(':').map(Number);
    const durationMinutes = (eh - sh) * 60 + (em - sm);
    return { top: Math.max(top, 0), height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, 20) };
  }
  return { top: Math.max(top, 0), height: HOUR_HEIGHT };
}
