import mongoose, { Schema } from 'mongoose';

const BreathingRecordSchema = new Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true }, // e.g., 'YYYY-MM-DD'
  durationSeconds: { type: Number, required: true },
  pattern: { type: String, default: "box" } // 'box', '4-7-8', etc
});

export default mongoose.models.BreathingRecord || mongoose.model('BreathingRecord', BreathingRecordSchema);
