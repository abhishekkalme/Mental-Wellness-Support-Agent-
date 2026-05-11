import mongoose, { Schema } from 'mongoose';

const BreathingRecordSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: String, required: true },
  durationSeconds: { type: Number, required: true },
  pattern: { type: String, default: 'box' },
});

BreathingRecordSchema.index({ userId: 1, date: -1 });

export default mongoose.models.BreathingRecord ||
  mongoose.model('BreathingRecord', BreathingRecordSchema);
