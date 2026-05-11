import mongoose, { Schema } from 'mongoose';

const SleepWellbeingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  iconName: { type: String },
});

SleepWellbeingSchema.index({ category: 1 });

export default mongoose.models.SleepWellbeing ||
  mongoose.model('SleepWellbeing', SleepWellbeingSchema);
