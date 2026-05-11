import mongoose, { Schema } from 'mongoose';

const SleepMusicSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  bpm: { type: String, required: true },
  audioUrl: { type: String, default: '' },
});

SleepMusicSchema.index({ category: 1 });

export default mongoose.models.SleepMusic || mongoose.model('SleepMusic', SleepMusicSchema);
