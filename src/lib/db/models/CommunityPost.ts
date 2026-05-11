import mongoose, { Schema } from 'mongoose';

const CommunityPostSchema = new Schema({
  user: { type: String, required: true },
  time: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
});

CommunityPostSchema.index({ time: -1 });
CommunityPostSchema.index({ deletedAt: 1 });
CommunityPostSchema.index({ user: 1, time: -1 });

export default mongoose.models.CommunityPost ||
  mongoose.model('CommunityPost', CommunityPostSchema);
