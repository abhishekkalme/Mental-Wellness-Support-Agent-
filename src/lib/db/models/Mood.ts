import mongoose, { Schema } from 'mongoose';

const MoodEntrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  intensity: { type: Number, min: 1, max: 10 },
  notes: { type: String, default: "" },
  activities: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.MoodEntry || mongoose.model('MoodEntry', MoodEntrySchema);
