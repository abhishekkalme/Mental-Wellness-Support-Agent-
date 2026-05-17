import mongoose, { Schema } from 'mongoose';

export interface IBooking {
  userId: mongoose.Types.ObjectId;
  therapistId: string;
  therapistProfileId: mongoose.Types.ObjectId;
  therapistName: string;
  date: string;
  time: string;
  duration: number;
  type: 'chat' | 'video' | 'phone';
  notes: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'in-progress';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
  currency: string;
  cancelledBy: string;
  cancelReason: string;
  rescheduledFrom: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: String, required: true },
    therapistProfileId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile' },
    therapistName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 50 },
    type: {
      type: String,
      enum: ['chat', 'video', 'phone'],
      default: 'chat',
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled', 'no-show', 'in-progress'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    amount: { type: Number, default: 0 },
    currency: {
      type: String,
      enum: [
        'USD',
        'INR',
        'EUR',
        'GBP',
        'CAD',
        'AUD',
        'BRL',
        'JPY',
        'SGD',
        'AED',
        'CHF',
        'CNY',
        'NZD',
        'SEK',
        'NOK',
        'KRW',
        'ZAR',
        'MXN',
        'HKD',
        'SAR',
      ],
      default: 'USD',
    },
    cancelledBy: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
    rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, date: -1 });
BookingSchema.index({ therapistProfileId: 1, date: 1 });
BookingSchema.index({ therapistId: 1, date: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index(
  { therapistProfileId: 1, date: 1, time: 1 },
  { partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
