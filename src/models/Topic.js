import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon_name: { type: String, default: 'Globe' },
    image_url: { type: String },
    color_gradient: { type: String, default: 'from-blue-600 to-indigo-400' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Topic', topicSchema);
