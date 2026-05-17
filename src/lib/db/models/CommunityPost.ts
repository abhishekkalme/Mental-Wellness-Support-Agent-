import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: 'discussion' | 'support' | 'achievement' | 'question' | 'resource';
  isAnonymous: boolean;
  tags: string[];
  language: string;
  mood?: string;
  stats: {
    likes: number;
    comments: number;
    saves: number;
  };
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
  reportCount: number;
  reportedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 10000 },
    type: {
      type: String,
      enum: ['discussion', 'support', 'achievement', 'question', 'resource'],
      default: 'discussion',
    },
    isAnonymous: { type: Boolean, default: false },
    tags: [{ type: String }],
    language: { type: String, default: 'en' },
    mood: { type: String },
    stats: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'flagged', 'removed'],
      default: 'approved',
    },
    reportCount: { type: Number, default: 0 },
    reportedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommunityPostSchema.index({ createdAt: -1 });
CommunityPostSchema.index({ tags: 1 });
CommunityPostSchema.index({ type: 1, createdAt: -1 });
CommunityPostSchema.index({ moderationStatus: 1 });
CommunityPostSchema.index({ 'stats.likes': -1 });
CommunityPostSchema.index({ deletedAt: 1 });
CommunityPostSchema.index({ author: 1, createdAt: -1 });

export default mongoose.models.CommunityPost ||
  mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
