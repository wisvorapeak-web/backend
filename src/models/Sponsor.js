import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logo_url: { type: String, required: true },
    website_url: { type: String },
    category: { type: String, enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner', 'Media'], default: 'Partner' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Sponsor', sponsorSchema);
