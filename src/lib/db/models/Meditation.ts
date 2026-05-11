import mongoose, { Schema } from 'mongoose';

const MeditationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  category: { type: String, required: true },
  img: { type: String, required: true },
  desc: { type: String, required: true },
});

MeditationSchema.index({ category: 1 });

export default mongoose.models.Meditation || mongoose.model('Meditation', MeditationSchema);
