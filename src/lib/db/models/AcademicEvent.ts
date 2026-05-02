import mongoose, { Schema } from 'mongoose';

const AcademicEventSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true }, // e.g., 'YYYY-MM-DD'
  type: { type: String, enum: ['exam', 'deadline', 'lecture', 'holiday'], required: true },
  course: { type: String },
  location: { type: String }
});

export default mongoose.models.AcademicEvent || mongoose.model('AcademicEvent', AcademicEventSchema);
