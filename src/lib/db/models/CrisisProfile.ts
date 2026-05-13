import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmergencyContact {
  _id?: Types.ObjectId | string;
  name: string;
  phone: string;
  relation: string;
  isTrustedAlert: boolean;
}

export interface ISafetyPlan {
  warningSigns: string;
  copingStrategies: string;
  reasonsToLive: string;
  safePlaces: string;
}

export interface ICrisisProfile extends Document {
  user: Schema.Types.ObjectId;
  emergencyContacts: IEmergencyContact[];
  safetyPlan: ISafetyPlan;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String, default: 'Friend' },
  isTrustedAlert: { type: Boolean, default: true },
});

const SafetyPlanSchema = new Schema(
  {
    warningSigns: { type: String, default: '' },
    copingStrategies: { type: String, default: '' },
    reasonsToLive: { type: String, default: '' },
    safePlaces: { type: String, default: '' },
  },
  { _id: false }
);

const CrisisProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    emergencyContacts: [EmergencyContactSchema],
    safetyPlan: { type: SafetyPlanSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.CrisisProfile ||
  mongoose.model<ICrisisProfile>('CrisisProfile', CrisisProfileSchema);
