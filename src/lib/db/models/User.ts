import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "user" | "admin" | "mentor";

export interface IUser extends Document {
  name: string;
  email?: string;
  passwordHash?: string;
  emailVerified: boolean;
  image?: string;
  role: UserRole;
  preferredLanguage: string;
  agentGender: "male" | "female" | "neutral";
  isPremium: boolean;
  onboarded: boolean;
  onboardingData: any;
  wellnessMetrics: any;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "mentor"],
      default: "user",
    },
    preferredLanguage: { type: String, default: "en" },
    agentGender: {
      type: String,
      enum: ["male", "female", "neutral"],
      default: "neutral",
    },
    isPremium: { type: Boolean, default: false },
    onboarded: { type: Boolean, default: false },
    onboardingData: { type: Schema.Types.Mixed, default: {} },
    wellnessMetrics: {
      type: Schema.Types.Mixed,
      default: {
        mental: 70,
        emotional: 65,
        physical: 60,
        social: 55,
        sleep: 80,
        spiritual: 40
      }
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
