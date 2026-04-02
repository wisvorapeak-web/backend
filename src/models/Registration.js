import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    institution: { type: String },
    country: { type: String, required: true },
    phone: { type: String },
    tier: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending', index: true },
    payment_status: { type: String, enum: ['Unpaid', 'Paid', 'Pending'], default: 'Unpaid' },
    amount: { type: Number, default: 0 },
    transaction_id: { type: String },
    payment_method: { type: String },
    registrationId: { type: String, unique: true },
    accommodation: { type: String },
    guest_addon: { type: Boolean, default: false }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Registration', registrationSchema);
