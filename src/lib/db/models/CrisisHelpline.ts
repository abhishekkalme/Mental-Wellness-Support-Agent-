import mongoose, { Schema } from 'mongoose';

const CrisisHelplineSchema = new Schema({
  country: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  link: { type: String }
});

export default mongoose.models.CrisisHelpline || mongoose.model('CrisisHelpline', CrisisHelplineSchema);
