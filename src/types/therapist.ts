export type SupportedCurrency =
  | 'USD'
  | 'INR'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'BRL'
  | 'JPY'
  | 'SGD'
  | 'AED'
  | 'CHF'
  | 'CNY'
  | 'NZD'
  | 'SEK'
  | 'NOK'
  | 'KRW'
  | 'ZAR'
  | 'MXN'
  | 'HKD'
  | 'SAR';

export interface TherapistProfile {
  _id: string;
  userId: string;
  user?: { name: string; email: string; image?: string };
  bio: string;
  title: string;
  education: { degree: string; institution: string; year: number }[];
  specializations: string[];
  languages: string[];
  sessionTypes: ('chat' | 'video' | 'phone')[];
  pricing: { chat: number; video: number; phone: number };
  currency: SupportedCurrency;
  timezone: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  onboardingCompleted: boolean;
  sessionDuration: number;
  yearsOfExperience: number;
  gender: string;
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  averageRating: number;
  totalReviews: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  _id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate: string | null;
  isBooked: boolean;
  bufferMinutes: number;
}

export interface Review {
  _id: string;
  userId: string;
  user?: { name: string; image?: string };
  therapistId: string;
  bookingId: string;
  rating: number;
  content: string;
  isVerified: boolean;
  isAnonymous: boolean;
  createdAt: string;
}
