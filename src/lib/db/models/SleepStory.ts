import mongoose, { Schema } from 'mongoose';

const SleepStorySchema = new Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  narrator: { type: String, required: true },
  category: { type: String, required: true },
  img: { type: String, required: true },
});

SleepStorySchema.index({ category: 1 });

export default mongoose.models.SleepStory || mongoose.model('SleepStory', SleepStorySchema);
