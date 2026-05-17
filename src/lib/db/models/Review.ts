import mongoose, { Schema } from 'mongoose';

export interface IReview {
  userId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  isVerified: boolean;
  isAnonymous: boolean;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, maxlength: 2000 },
    isVerified: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ therapistId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, therapistId: 1 });
ReviewSchema.index({ bookingId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
