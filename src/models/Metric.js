import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  icon_name: { type: String, default: 'BarChart' },
  display_order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Metric', metricSchema);
