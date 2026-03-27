import mongoose from 'mongoose';

const venueGallerySchema = new mongoose.Schema({
    image_url: { type: String, required: true },
    caption: { type: String, default: '' },
    category: { type: String, enum: ['venue', 'accommodation', 'tourism', 'past_event'], default: 'venue' },
    display_order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('VenueGallery', venueGallerySchema);
