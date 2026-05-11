import mongoose, { Schema } from 'mongoose';

const AcademicEventSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['exam', 'deadline', 'lecture', 'holiday'], required: true },
  course: { type: String },
  location: { type: String },
});

AcademicEventSchema.index({ userId: 1, date: 1 });
AcademicEventSchema.index({ userId: 1, type: 1 });

export default mongoose.models.AcademicEvent ||
  mongoose.model('AcademicEvent', AcademicEventSchema);
