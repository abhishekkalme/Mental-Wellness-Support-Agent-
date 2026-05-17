import mongoose, { Schema } from 'mongoose';

export interface IFavoriteTherapist {
  userId: mongoose.Types.ObjectId;
  therapistId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteTherapistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  therapistId: { type: Schema.Types.ObjectId, ref: 'TherapistProfile', required: true },
  createdAt: { type: Date, default: Date.now },
});

FavoriteTherapistSchema.index({ userId: 1, therapistId: 1 }, { unique: true });
FavoriteTherapistSchema.index({ therapistId: 1 });

export default mongoose.models.FavoriteTherapist ||
  mongoose.model<IFavoriteTherapist>('FavoriteTherapist', FavoriteTherapistSchema);
