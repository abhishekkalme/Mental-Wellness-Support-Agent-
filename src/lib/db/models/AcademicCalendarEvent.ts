import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicCalendarEvent extends Document {
  userId: string;
  title: string;
  description?: string;
  eventType:
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
  startDate: Date;
  endDate?: Date;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  location?: string;
  locationLink?: string;
  course?: string;
  courseCode?: string;
  semesterId?: string;
  color?: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrenceEndDate?: Date;
  reminders: { time: number; type: 'notification' | 'email' }[];
  status: 'scheduled' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AcademicCalendarEventSchema = new Schema<IAcademicCalendarEvent>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, maxlength: 300 },
    description: { type: String, maxlength: 2000 },
    eventType: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    allDay: { type: Boolean, default: true },
    startTime: { type: String },
    endTime: { type: String },
    location: { type: String, maxlength: 500 },
    locationLink: { type: String },
    course: { type: String, maxlength: 200 },
    courseCode: { type: String, maxlength: 50 },
    semesterId: { type: String },
    color: { type: String },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'biweekly', 'monthly'],
      default: 'none',
    },
    recurrenceEndDate: { type: Date },
    reminders: [
      {
        time: { type: Number, required: true },
        type: { type: String, enum: ['notification', 'email'], required: true },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

AcademicCalendarEventSchema.index({ userId: 1, startDate: 1 });
AcademicCalendarEventSchema.index({ userId: 1, eventType: 1 });
AcademicCalendarEventSchema.index({ userId: 1, semesterId: 1 });
AcademicCalendarEventSchema.index({ userId: 1, status: 1 });

export default (mongoose.models.AcademicCalendarEvent as mongoose.Model<IAcademicCalendarEvent>) ||
  mongoose.model<IAcademicCalendarEvent>('AcademicCalendarEvent', AcademicCalendarEventSchema);
