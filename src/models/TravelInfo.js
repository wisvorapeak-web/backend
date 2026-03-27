import mongoose from 'mongoose';

const travelInfoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon_name: { type: String, default: 'Plane' },
  display_order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('TravelInfo', travelInfoSchema);
