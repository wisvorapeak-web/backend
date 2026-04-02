import mongoose from 'mongoose';

const failedPaymentSchema = new mongoose.Schema({
    // Contact details so team can follow up
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    institution: { type: String },
    country: { type: String },

    // Payment context
    tier_name: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    method: { type: String, required: true, enum: ['stripe', 'razorpay', 'paypal'] },

    // Failure details
    error_code: { type: String },
    error_description: { type: String },
    error_source: { type: String },          // e.g. 'gateway', 'network', 'bank'
    error_step: { type: String },            // e.g. 'order_creation', 'checkout', 'payment_processing'
    gateway_order_id: { type: String },      // Razorpay order_id, Stripe session_id, PayPal order_id
    gateway_payment_id: { type: String },    // If partially created

    // Link to registration if exists
    registration_id: { type: String },

    // Admin follow-up
    follow_up_status: { 
        type: String, 
        enum: ['Pending', 'Contacted', 'Resolved', 'Abandoned'], 
        default: 'Pending' 
    },
    follow_up_notes: { type: String },
    followed_up_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    followed_up_at: { type: Date },

    // Browser/device info for debugging
    user_agent: { type: String },
    ip_address: { type: String },
}, { timestamps: true });

// Index for quick lookups
failedPaymentSchema.index({ email: 1 });
failedPaymentSchema.index({ follow_up_status: 1 });
failedPaymentSchema.index({ createdAt: -1 });

export default mongoose.model('FailedPayment', failedPaymentSchema);
