import mongoose, { Schema } from 'mongoose';

const SleepEntrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: String, required: true }, // e.g., 'YYYY-MM-DD'
  quality: { type: Number, min: 1, max: 5, required: true },
  durationHours: { type: Number, required: true }
});

export default mongoose.models.SleepEntry || mongoose.model('SleepEntry', SleepEntrySchema);
