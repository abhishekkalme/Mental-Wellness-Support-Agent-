import { z } from 'zod';

export const eventTypeEnum = z.enum([
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
]);

export const eventStatusEnum = z.enum(['scheduled', 'cancelled', 'rescheduled']);
export const priorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const recurrenceEnum = z.enum(['none', 'daily', 'weekly', 'biweekly', 'monthly']);

export const reminderSchema = z.object({
  time: z.number().min(0),
  type: z.enum(['notification', 'email']),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300),
  description: z.string().max(2000).optional().default(''),
  eventType: eventTypeEnum,
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  allDay: z.boolean().default(true),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)')
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)')
    .optional(),
  location: z.string().max(500).optional().default(''),
  locationLink: z.string().url('Invalid URL').optional().or(z.literal('')),
  course: z.string().max(200).optional().default(''),
  courseCode: z.string().max(50).optional().default(''),
  semesterId: z.string().optional().default(''),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color')
    .optional(),
  recurrence: recurrenceEnum.default('none'),
  recurrenceEndDate: z.string().optional(),
  reminders: z.array(reminderSchema).optional().default([]),
  priority: priorityEnum.default('medium'),
  status: eventStatusEnum.default('scheduled'),
  tags: z.array(z.string()).optional().default([]),
});

export const updateEventSchema = createEventSchema.partial();

export const createSemesterSchema = z.object({
  name: z.string().min(1, 'Semester name is required').max(200),
  academicYear: z.string().min(1, 'Academic year is required').max(20),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().default(false),
  institution: z.string().max(300).optional().default(''),
});

export const updateSemesterSchema = createSemesterSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;
export type UpdateSemesterInput = z.infer<typeof updateSemesterSchema>;
