import mongoose from 'mongoose';

const importantDateSchema = new mongoose.Schema({
  event: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, default: 'Milestone date for participants.' },
  display_order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('ImportantDate', importantDateSchema);
