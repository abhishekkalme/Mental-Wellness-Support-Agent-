import mongoose, { Schema } from 'mongoose';

export interface IAvailabilitySlot {
  therapistId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate: Date | null;
  isBooked: boolean;
  bufferMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySlotSchema = new Schema(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isRecurring: { type: Boolean, default: true },
    specificDate: { type: Date, default: null },
    isBooked: { type: Boolean, default: false },
    bufferMinutes: { type: Number, default: 10 },
  },
  { timestamps: true }
);

AvailabilitySlotSchema.index({ therapistId: 1, dayOfWeek: 1 });
AvailabilitySlotSchema.index({ therapistId: 1, specificDate: 1 });
AvailabilitySlotSchema.index({ therapistId: 1, isBooked: 1 });

export default mongoose.models.AvailabilitySlot ||
  mongoose.model<IAvailabilitySlot>('AvailabilitySlot', AvailabilitySlotSchema);
