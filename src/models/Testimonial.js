import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    institution: { type: String },
    country: { type: String },
    quote: { type: String, required: true },
    image_url: { type: String },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Testimonial', testimonialSchema);
