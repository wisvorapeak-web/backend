import mongoose from 'mongoose';

const brochureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    file_url: { type: String, required: true },
    thumbnail_url: { type: String },
    type: { type: String, enum: ['PDF', 'Image', 'Link'], default: 'PDF' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Brochure', brochureSchema);
