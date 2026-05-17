import mongoose, { Schema } from 'mongoose';

export interface ISessionNote {
  therapistId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  content: string;
  aiSummary: string;
  moodBefore: number;
  moodAfter: number;
  goals: string[];
  progress: string;
  followUpDate: Date | null;
  isEmergency: boolean;
  riskFlags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SessionNoteSchema = new Schema(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    aiSummary: { type: String, default: '' },
    moodBefore: { type: Number, min: 1, max: 10 },
    moodAfter: { type: Number, min: 1, max: 10 },
    goals: { type: [String], default: [] },
    progress: { type: String, default: '' },
    followUpDate: { type: Date, default: null },
    isEmergency: { type: Boolean, default: false },
    riskFlags: { type: [String], default: [] },
  },
  { timestamps: true }
);

SessionNoteSchema.index({ therapistId: 1, createdAt: -1 });
SessionNoteSchema.index({ clientId: 1 });
SessionNoteSchema.index({ bookingId: 1 }, { unique: true });

export default mongoose.models.SessionNote ||
  mongoose.model<ISessionNote>('SessionNote', SessionNoteSchema);
