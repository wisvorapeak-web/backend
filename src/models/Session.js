import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  day: { type: String, default: 'Day 1' },
  location: { type: String, default: 'Online' },
  session_type: { 
    type: String, 
    enum: ['Technical Session', 'Keynote Address', 'Plenary Speech', 'Poster Presentation', 'Networking Break'],
    default: 'Technical Session' 
  },
  speaker_name: { type: String, default: '' },
  description: { type: String, default: '' },
  display_order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
