import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    registration_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', index: true },
    payment_id: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true },
    method: { type: String, required: true },
    billing_details: { type: Object }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
