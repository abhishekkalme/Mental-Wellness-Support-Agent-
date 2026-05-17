import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPost extends Document {
  user: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedPostSchema = new Schema<ISavedPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  },
  { timestamps: true }
);

SavedPostSchema.index({ user: 1, post: 1 }, { unique: true });
SavedPostSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.SavedPost ||
  mongoose.model<ISavedPost>('SavedPost', SavedPostSchema);
