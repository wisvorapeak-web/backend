import mongoose from 'mongoose';

const pricingTierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Registration', 'Sponsorship', 'Exhibition', 'Accommodation', 'Other'], default: 'Registration' },
    amount: { type: Number, required: true },
    currency: { type: String, default: '$' },
    description: { type: String },
    features: [{ type: String }],
    is_popular: { type: Boolean, default: false },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('PricingTier', pricingTierSchema);
