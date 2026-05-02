import mongoose, { Schema } from 'mongoose';

const SleepWellbeingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., 'Routine', 'Filter', 'Strategy'
  iconName: { type: String }
});

export default mongoose.models.SleepWellbeing || mongoose.model('SleepWellbeing', SleepWellbeingSchema);
