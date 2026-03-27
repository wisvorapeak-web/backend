import mongoose from 'mongoose';

const venueSettingSchema = new mongoose.Schema({
    host_city: { type: String, default: 'Guwahati, Assam' },
    venue_name: { type: String, default: 'World Scientific Summit Center' },
    venue_address: { type: String, default: 'Guwahati, India' },
    venue_description: { type: String, default: 'State-of-the-art facility for the world food agro-tech summit.' },
    map_url: { type: String, default: '' },
    virtual_tour_url: { type: String, default: '' },
    venue_image_url: { type: String, default: '' },
    accommodation_info: { type: String, default: '' },
    tourism_info: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('VenueSetting', venueSettingSchema);
