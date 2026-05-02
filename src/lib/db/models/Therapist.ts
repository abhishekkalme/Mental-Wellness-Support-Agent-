import mongoose, { Schema } from 'mongoose';

const TherapistSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  reviews: { type: Number, default: 0 },
  availability: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: String, required: true },
  tags: { type: [String], default: [] }
});

export default mongoose.models.Therapist || mongoose.model('Therapist', TherapistSchema);
