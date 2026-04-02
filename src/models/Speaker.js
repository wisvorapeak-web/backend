import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    university: { type: String, required: true },
    country: { type: String },
    image_url: { type: String, default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a' },
    linkedin_url: { type: String },
    twitter_url: { type: String },
    bio: { type: String },
    category: { type: String, enum: ['Plenary', 'Keynote', 'Invited', 'New Researchers', 'Poster Displays', 'Regular'], default: 'Regular' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Speaker', speakerSchema);
