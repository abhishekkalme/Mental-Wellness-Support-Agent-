import mongoose, { Schema } from 'mongoose';

const JournalEntrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  prompt: { type: String, default: "" },
  content: { type: String, required: true },
  emotionTags: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
