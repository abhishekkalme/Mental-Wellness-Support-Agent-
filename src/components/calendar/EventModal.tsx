'use client';

import { useReducer, useRef, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type {
  AcademicCalendarEvent,
  AcademicEventType,
  EventPriority,
  EventStatus,
  RecurrenceType,
  Semester,
} from '@/lib/types';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from '@/lib/types';

const EVENT_TYPES: AcademicEventType[] = [
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
  'office-hours',
  'study-group',
  'personal',
];

const PRIORITIES: EventPriority[] = ['low', 'medium', 'high', 'critical'];
const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
];

type FormState = {
  title: string;
  eventType: AcademicEventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  locationLink: string;
  course: string;
  courseCode: string;
  semesterId: string;
  priority: EventPriority;
  recurrence: RecurrenceType;
  recurrenceEndDate: string;
  status: EventStatus;
  tags: string;
  errors: Record<string, string>;
};

type FormAction =
  | { type: 'SET'; field: keyof FormState; value: unknown }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'INIT'; state: Partial<FormState> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET':
      return { ...state, [action.field]: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'INIT':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

function initFormState(
  event?: AcademicCalendarEvent | null,
  initialDate?: Date | null,
  semesters?: Semester[]
): FormState {
  const activeSem = semesters?.find((s) => s.isActive);
  if (event) {
    return {
      title: event.title,
      eventType: event.eventType,
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      endDate: event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd') : '',
      allDay: event.allDay,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      description: event.description || '',
      location: event.location || '',
      locationLink: event.locationLink || '',
      course: event.course || '',
      courseCode: event.courseCode || '',
      semesterId: event.semesterId || '',
      priority: event.priority,
      recurrence: event.recurrence,
      recurrenceEndDate: event.recurrenceEndDate
        ? format(new Date(event.recurrenceEndDate), 'yyyy-MM-dd')
        : '',
      status: event.status,
      tags: event.tags?.join(', ') || '',
      errors: {},
    };
  }
  return {
    title: '',
    eventType: 'exam',
    startDate: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    allDay: true,
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    locationLink: '',
    course: '',
    courseCode: '',
    semesterId: activeSem?._id || '',
    priority: 'medium',
    recurrence: 'none',
    recurrenceEndDate: '',
    status: 'scheduled',
    tags: '',
    errors: {},
  };
}

const inputBaseClass =
  'w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors';
const selectBaseClass =
  'w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none';
const labelClass = 'block text-sm font-medium text-white/70 mb-1.5';
const errorClass = 'text-xs text-destructive mt-1';

const InputField = memo(function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputBaseClass}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
});

const SelectField = memo(function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectBaseClass}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

const DateField = memo(function DateField({
  label,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && ' *'}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBaseClass} [color-scheme:dark]`}
      />
      {error && <p className={errorClass}>{error}</p>}
    </div>
  );
});

const TextAreaField = memo(function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`${inputBaseClass} resize-none py-3 h-auto`}
      />
    </div>
  );
});

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AcademicCalendarEvent>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  event?: AcademicCalendarEvent | null;
  initialDate?: Date | null;
  semesters?: Semester[];
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  initialDate,
  semesters = [],
}: EventModalProps) {
  const isEditing = !!event;
  const formRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [saving, setSaving] = useReducer((_: boolean, v: boolean) => v, false);
  const [deleting, setDeleting] = useReducer((_: boolean, v: boolean) => v, false);

  const [formState, dispatch] = useReducer(formReducer, { event, initialDate, semesters }, (init) =>
    initFormState(init.event, init.initialDate, init.semesters)
  );

  useEffect(() => {
    if (isOpen) {
      initialized.current = true;
      dispatch({
        type: 'INIT',
        state: initFormState(event, initialDate, semesters),
      });
    } else {
      initialized.current = false;
    }
  }, [isOpen, event, initialDate, semesters]);

  const set = useCallback((field: keyof FormState, value: unknown) => {
    dispatch({ type: 'SET', field, value });
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!formState.title.trim()) errs.title = 'Title is required';
    if (!formState.startDate) errs.startDate = 'Start date is required';
    if (formState.endDate && formState.endDate < formState.startDate) {
      errs.endDate = 'End date must be after start date';
    }
    if (formState.locationLink && !/^https?:\/\/.+/.test(formState.locationLink)) {
      errs.locationLink = 'Invalid URL';
    }
    dispatch({ type: 'SET_ERRORS', errors: errs });
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const data: Partial<AcademicCalendarEvent> = {
        title: formState.title.trim(),
        eventType: formState.eventType,
        startDate: new Date(formState.startDate).toISOString(),
        endDate: formState.endDate ? new Date(formState.endDate).toISOString() : undefined,
        allDay: formState.allDay,
        startTime: formState.allDay ? undefined : formState.startTime,
        endTime: formState.allDay ? undefined : formState.endTime,
        description: formState.description.trim(),
        location: formState.location.trim(),
        locationLink: formState.locationLink.trim() || undefined,
        course: formState.course.trim(),
        courseCode: formState.courseCode.trim(),
        semesterId: formState.semesterId,
        priority: formState.priority,
        recurrence: formState.recurrence,
        recurrenceEndDate:
          formState.recurrence !== 'none' && formState.recurrenceEndDate
            ? new Date(formState.recurrenceEndDate).toISOString()
            : undefined,
        status: formState.status,
        tags: formState.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        reminders: [],
      };

      if (isEditing && event) {
        data._id = event._id;
      }

      await onSave(data);
      onClose();
    } catch {
      dispatch({ type: 'SET_ERRORS', errors: { form: 'Failed to save event.' } });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(event._id);
      onClose();
    } catch {
      dispatch({ type: 'SET_ERRORS', errors: { form: 'Failed to delete event.' } });
    } finally {
      setDeleting(false);
    }
  }

  const typeOptions = EVENT_TYPES.map((t) => ({
    value: t,
    label: `${EVENT_TYPE_LABELS[t]}`,
  }));
  const priorityOptions = PRIORITIES.map((p) => ({
    value: p,
    label: p.charAt(0).toUpperCase() + p.slice(1),
  }));
  const semesterOptions = [
    { value: '', label: 'No semester' },
    ...semesters.map((s) => ({
      value: s._id,
      label: `${s.name} (${s.academicYear})${s.isActive ? ' — Active' : ''}`,
    })),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            ref={formRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto surface-card p-6 shadow-2xl custom-scroll"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{isEditing ? 'Edit Event' : 'New Event'}</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors shrink-0"
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4 text-white/60"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {formState.errors.form && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {formState.errors.form}
                </div>
              )}

              <InputField
                label="Title"
                value={formState.title}
                onChange={(v) => set('title', v)}
                placeholder="Enter event title"
                required
                error={formState.errors.title}
              />

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Type"
                  value={formState.eventType}
                  onChange={(v) => set('eventType', v)}
                  options={typeOptions}
                />
                <SelectField
                  label="Priority"
                  value={formState.priority}
                  onChange={(v) => set('priority', v)}
                  options={priorityOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DateField
                  label="Start Date"
                  value={formState.startDate}
                  onChange={(v) => set('startDate', v)}
                  required
                  error={formState.errors.startDate}
                />
                <DateField
                  label="End Date"
                  value={formState.endDate}
                  onChange={(v) => set('endDate', v)}
                  error={formState.errors.endDate}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formState.allDay}
                  onChange={(e) => set('allDay', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent accent-[#E2FF6F]"
                />
                <span className="text-sm text-white/70">All day</span>
              </label>

              {!formState.allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start Time</label>
                    <input
                      type="time"
                      value={formState.startTime}
                      onChange={(e) => set('startTime', e.target.value)}
                      className={`${inputBaseClass} [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Time</label>
                    <input
                      type="time"
                      value={formState.endTime}
                      onChange={(e) => set('endTime', e.target.value)}
                      className={`${inputBaseClass} [color-scheme:dark]`}
                    />
                  </div>
                </div>
              )}

              <TextAreaField
                label="Description"
                value={formState.description}
                onChange={(v) => set('description', v)}
                placeholder="Add details about this event..."
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Course"
                  value={formState.course}
                  onChange={(v) => set('course', v)}
                  placeholder="e.g. CS 101"
                />
                <InputField
                  label="Course Code"
                  value={formState.courseCode}
                  onChange={(v) => set('courseCode', v)}
                  placeholder="e.g. CS101"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Location"
                  value={formState.location}
                  onChange={(v) => set('location', v)}
                  placeholder="Room 301"
                />
                <InputField
                  label="Location Link"
                  value={formState.locationLink}
                  onChange={(v) => set('locationLink', v)}
                  placeholder="https://..."
                  error={formState.errors.locationLink}
                />
              </div>

              <div>
                <label className={labelClass}>Semester</label>
                <select
                  value={formState.semesterId}
                  onChange={(e) => set('semesterId', e.target.value)}
                  className={selectBaseClass}
                >
                  {semesterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Repeat"
                  value={formState.recurrence}
                  onChange={(v) => set('recurrence', v)}
                  options={RECURRENCE_OPTIONS}
                />
                {formState.recurrence !== 'none' && (
                  <DateField
                    label="End Repeat"
                    value={formState.recurrenceEndDate}
                    onChange={(v) => set('recurrenceEndDate', v)}
                  />
                )}
              </div>

              <InputField
                label="Tags"
                value={formState.tags}
                onChange={(v) => set('tags', v)}
                placeholder="comma, separated, tags"
              />

              {isEditing && (
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) => set('status', e.target.value as EventStatus)}
                    className={selectBaseClass}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-xl bg-primary text-black font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                </button>

                {isEditing && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-11 px-6 rounded-xl bg-destructive/10 text-destructive font-medium text-sm hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 px-6 rounded-xl border border-white/[0.1] text-white/60 font-medium text-sm hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
