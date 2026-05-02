import mongoose, { Schema } from 'mongoose';

const CommunityGroupSchema = new Schema({
  name: { type: String, required: true },
  members: { type: String, required: true },
  active: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, required: true },
  joined: { type: Boolean, default: false }
});

export default mongoose.models.CommunityGroup || mongoose.model('CommunityGroup', CommunityGroupSchema);
