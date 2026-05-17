import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityReaction extends Document {
  user: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment';
  targetId: mongoose.Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

const CommunityReactionSchema = new Schema<ICommunityReaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

CommunityReactionSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
CommunityReactionSchema.index({ targetType: 1, targetId: 1 });
CommunityReactionSchema.index({ targetType: 1, targetId: 1, emoji: 1 });

export default mongoose.models.CommunityReaction ||
  mongoose.model<ICommunityReaction>('CommunityReaction', CommunityReactionSchema);
