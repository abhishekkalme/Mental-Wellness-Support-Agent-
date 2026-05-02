import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  image?: string;
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
    image: { type: String },
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
