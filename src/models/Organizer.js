import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    affiliation: { type: String },
    location: { type: String },
    image_url: { type: String, default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Organizer' },
    category: { type: String, enum: ['Chairs', 'Scientific Committee', 'Organizing Committee', 'Advisory Board', 'Technical Committee'], default: 'Scientific Committee' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true 
});

export default mongoose.model('Organizer', organizerSchema);
