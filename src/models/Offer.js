import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    tierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingTier',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Expired'],
        default: 'Pending'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    }
}, { timestamps: true });

// Check expiry automatically when queried if needed, but a cron or pre handler is better.

export default mongoose.model('Offer', offerSchema);
