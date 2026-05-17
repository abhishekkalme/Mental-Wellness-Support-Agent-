import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityTag extends Document {
  name: string;
  usageCount: number;
  isSystem: boolean;
  createdAt: Date;
}

const CommunityTagSchema = new Schema<ICommunityTag>(
  {
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
    usageCount: { type: Number, default: 1 },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommunityTagSchema.index({ usageCount: -1 });

export default mongoose.models.CommunityTag ||
  mongoose.model<ICommunityTag>('CommunityTag', CommunityTagSchema);
