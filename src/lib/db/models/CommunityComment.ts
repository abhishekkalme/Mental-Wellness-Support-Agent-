import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  parentComment: mongoose.Types.ObjectId | null;
  content: string;
  isAnonymous: boolean;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  moderationStatus: 'approved' | 'pending' | 'flagged' | 'removed';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'CommunityComment', default: null },
    content: { type: String, required: true, maxlength: 5000 },
    isAnonymous: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    moderationStatus: {
      type: String,
      enum: ['approved', 'pending', 'flagged', 'removed'],
      default: 'approved',
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommunityCommentSchema.index({ post: 1, createdAt: 1 });
CommunityCommentSchema.index({ author: 1 });
CommunityCommentSchema.index({ parentComment: 1 });

export default mongoose.models.CommunityComment ||
  mongoose.model<ICommunityComment>('CommunityComment', CommunityCommentSchema);
