import mongoose from 'mongoose';

const brochureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, default: 'General' },
    description: { type: String }, // Optional description
    file_url: { type: String, required: true },
    file_size: { type: String }, // For '2.4 MB' etc.
    icon_name: { type: String, default: 'FileDown' },
    thumbnail_url: { type: String },
    type: { type: String, default: 'PDF' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Brochure', brochureSchema);
