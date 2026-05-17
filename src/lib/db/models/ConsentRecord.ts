import mongoose, { Schema } from 'mongoose';

export interface IConsentRecord {
  userId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  type:
    | 'teletherapy'
    | 'session-recording'
    | 'data-sharing'
    | 'emergency-contact'
    | 'payment'
    | 'general';
  granted: boolean;
  grantedAt: Date;
  revokedAt: Date | null;
  ipAddress: string;
  consentVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
    type: {
      type: String,
      enum: [
        'teletherapy',
        'session-recording',
        'data-sharing',
        'emergency-contact',
        'payment',
        'general',
      ],
      required: true,
    },
    granted: { type: Boolean, required: true },
    grantedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
    ipAddress: { type: String, default: '' },
    consentVersion: { type: String, default: '1.0' },
  },
  { timestamps: true }
);

ConsentRecordSchema.index({ userId: 1, therapistId: 1, type: 1 });

export default mongoose.models.ConsentRecord ||
  mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
