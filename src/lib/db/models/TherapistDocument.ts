import mongoose, { Schema } from 'mongoose';

export interface ITherapistDocument {
  therapistId: mongoose.Types.ObjectId;
  type: 'license' | 'certification' | 'degree' | 'id-proof' | 'insurance' | 'other';
  name: string;
  fileUrl: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  notes: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TherapistDocumentSchema = new Schema(
  {
    therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
    type: {
      type: String,
      enum: ['license', 'certification', 'degree', 'id-proof', 'insurance', 'other'],
      required: true,
    },
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TherapistDocumentSchema.index({ therapistId: 1 });
TherapistDocumentSchema.index({ verificationStatus: 1 });

export default mongoose.models.TherapistDocument ||
  mongoose.model<ITherapistDocument>('TherapistDocument', TherapistDocumentSchema);
