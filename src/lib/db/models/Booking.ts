import mongoose, { Schema } from 'mongoose';

const BookingSchema = new Schema(
  {
    userId: { type: String, required: true },
    therapistId: { type: String, required: true },
    therapistName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: {
      type: String,
      enum: ['chat', 'video', 'phone'],
      default: 'chat',
    },
    notes: { type: String },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, date: -1 });
BookingSchema.index({ therapistId: 1, date: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
