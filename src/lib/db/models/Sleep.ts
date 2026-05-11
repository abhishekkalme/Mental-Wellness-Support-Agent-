import mongoose, { Schema } from 'mongoose';

const SleepEntrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: String, required: true },
  quality: { type: Number, min: 1, max: 5, required: true },
  durationHours: { type: Number, required: true },
});

SleepEntrySchema.index({ userId: 1, date: -1 });
SleepEntrySchema.index({ userId: 1 }, { background: true });

export default mongoose.models.SleepEntry || mongoose.model('SleepEntry', SleepEntrySchema);
