import mongoose, { Schema } from 'mongoose';

export interface ITherapistProfile {
  userId: mongoose.Types.ObjectId;
  bio: string;
  title: string;
  education: { degree: string; institution: string; year: number }[];
  specializations: string[];
  languages: string[];
  sessionTypes: ('chat' | 'video' | 'phone')[];
  pricing: { chat: number; video: number; phone: number };
  currency: string;
  timezone: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  sessionDuration: number;
  yearsOfExperience: number;
  gender: string;
  address: string;
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const TherapistProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, default: '' },
    title: { type: String, default: '' },
    education: { type: [EducationSchema], default: [] },
    specializations: { type: [String], default: [] },
    languages: { type: [String], default: ['en'] },
    sessionTypes: {
      type: [String],
      enum: ['chat', 'video', 'phone'],
      default: ['video'],
    },
    pricing: {
      chat: { type: Number, default: 30 },
      video: { type: Number, default: 50 },
      phone: { type: Number, default: 40 },
    },
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
    timezone: { type: String, default: 'UTC' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    onboardingCompleted: { type: Boolean, default: false },
    sessionDuration: { type: Number, default: 50 },
    yearsOfExperience: { type: Number, default: 0 },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    acceptsInsurance: { type: Boolean, default: false },
    insuranceProviders: { type: [String], default: [] },
  },
  { timestamps: true }
);

TherapistProfileSchema.index({ specializations: 1 });
TherapistProfileSchema.index({ languages: 1 });
TherapistProfileSchema.index({ verificationStatus: 1 });
TherapistProfileSchema.index({ isActive: 1 });

export default mongoose.models.TherapistProfile ||
  mongoose.model<ITherapistProfile>('TherapistProfile', TherapistProfileSchema);
