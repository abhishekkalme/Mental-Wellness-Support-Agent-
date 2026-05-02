import mongoose, { Schema } from 'mongoose';

const HabitSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
  streak: { type: Number, default: 0 },
  completedDates: { type: [String], default: [] }
});

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
