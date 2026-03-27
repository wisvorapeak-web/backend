import mongoose from 'mongoose';

const audienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String, required: true },
  benefits: [{ type: String }],
  icon_name: { type: String, default: 'Users' },
  link_path: { type: String },
  display_order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Audience', audienceSchema);
