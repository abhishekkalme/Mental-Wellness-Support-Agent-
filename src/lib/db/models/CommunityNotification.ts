import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'reply'
  | 'like'
  | 'follow'
  | 'mention'
  | 'achievement'
  | 'moderation'
  | 'system';

export interface ICommunityNotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  sourceUser: mongoose.Types.ObjectId;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const CommunityNotificationSchema = new Schema<ICommunityNotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['reply', 'like', 'follow', 'mention', 'achievement', 'moderation', 'system'],
      required: true,
    },
    sourceUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: Schema.Types.ObjectId, ref: 'CommunityPost' },
    comment: { type: Schema.Types.ObjectId, ref: 'CommunityComment' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommunityNotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
CommunityNotificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.CommunityNotification ||
  mongoose.model<ICommunityNotification>('CommunityNotification', CommunityNotificationSchema);
