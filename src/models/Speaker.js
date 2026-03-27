import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    institution: { type: String, required: true },
    photo_url: { type: String, default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a' },
    linkedin_url: { type: String },
    twitter_url: { type: String },
    bio: { type: String },
    type: { type: String, enum: ['Keynote', 'Guest', 'Chair', 'Regular'], default: 'Regular' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Speaker', speakerSchema);
