import mongoose, { Schema } from 'mongoose';

const JournalEntrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  prompt: { type: String, default: '' },
  content: { type: String, required: true },
  emotionTags: { type: [String], default: [] },
  timestamp: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

JournalEntrySchema.index({ userId: 1, timestamp: -1 });
JournalEntrySchema.index({ userId: 1, deletedAt: 1 });
JournalEntrySchema.index({ id: 1 }, { unique: true });

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
