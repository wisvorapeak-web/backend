import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        lowercase: true,
        trim: true
    },
    token: { 
        type: String, 
        required: true, 
        unique: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'sub-admin', 'editor', 'staff', 'judge', 'viewer'], 
        default: 'staff' 
    },
    invitedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'revoked', 'expired'], 
        default: 'pending' 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    }
}, { timestamps: true });

// Index to automatically expire invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Invitation', invitationSchema);
