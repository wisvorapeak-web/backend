import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    type: { type: String, enum: ['contact', 'abstract'], required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    institution: { type: String },
    country: { type: String },
    phone: { type: String },
    subject: { type: String },     // For contact
    message: { type: String },     // For contact
    topic: { type: String },       // For abstract
    category: { type: String },    // For abstract (e.g. Plenary, Keynote, etc.)
    title: { type: String },       // For abstract
    abstract: { type: String },    // For abstract
    file_url: { type: String },    // For abstract
    review_comment: { type: String },  // For abstract review
    reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reviewer
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Revision', 'Replied'], default: 'Pending', index: true },
    submissionId: { type: String, unique: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model('Submission', submissionSchema);
