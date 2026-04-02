import Topic from '../models/Topic.js';
import Speaker from '../models/Speaker.js';
import Sponsor from '../models/Sponsor.js';
import Brochure from '../models/Brochure.js';
import PricingTier from '../models/PricingTier.js';
import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Registration from '../models/Registration.js';
import SiteSetting from '../models/SiteSetting.js';
import FAQ from '../models/FAQ.js';
import Testimonial from '../models/Testimonial.js';
import Audience from '../models/Audience.js';
import Metric from '../models/Metric.js';
import TravelInfo from '../models/TravelInfo.js';
import VenueSetting from '../models/VenueSetting.js';
import VenueGallery from '../models/VenueGallery.js';
import Invitation from '../models/Invitation.js';
import Session from '../models/Session.js';
import ImportantDate from '../models/ImportantDate.js';
import FailedPayment from '../models/FailedPayment.js';
import crypto from 'crypto';
import { sendEmail } from '../config/mailer.js';
import { clearCache } from '../middleware/cacheMiddleware.js';

// --- GENERIC CONTENT CRUD (Used for multiple assets) ---
const createCrudSet = (Model, label) => ({
    getAll: async (req, res) => {
        try { res.status(200).json(await Model.find().sort({ display_order: 1, createdAt: -1 })); }
        catch (err) { res.status(500).json({ error: `Failed to fetch ${label}` }); }
    },
    create: async (req, res) => {
        try { const data = await Model.create(req.body); await clearCache('*'); res.status(201).json(data); }
        catch (err) { res.status(500).json({ error: `Failed to create ${label}` }); }
    },
    update: async (req, res) => {
        try { const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true }); await clearCache('*'); res.status(200).json(data); }
        catch (err) { res.status(500).json({ error: `Failed to update ${label}` }); }
    },
    delete: async (req, res) => {
        try { await Model.findByIdAndDelete(req.params.id); await clearCache('*'); res.status(200).json({ message: `${label} removed.` }); }
        catch (err) { res.status(500).json({ error: `Failed to remove ${label}` }); }
    }
});

// FAQ Handlers
const faqCrud = createCrudSet(FAQ, 'FAQ');
export const getAllFaqs = faqCrud.getAll;
export const createFaq = faqCrud.create;
export const updateFaq = faqCrud.update;
export const deleteFaq = faqCrud.delete;

// Testimonial Handlers
const testimonialCrud = createCrudSet(Testimonial, 'Testimonial');
export const getAllTestimonials = testimonialCrud.getAll;
export const createTestimonial = testimonialCrud.create;
export const updateTestimonial = testimonialCrud.update;
export const deleteTestimonial = testimonialCrud.delete;

// Audience Handlers
const audienceCrud = createCrudSet(Audience, 'Audience');
export const getAllAudiences = audienceCrud.getAll;
export const createAudience = audienceCrud.create;
export const updateAudience = audienceCrud.update;
export const deleteAudience = audienceCrud.delete;

// Metrics Handlers
const metricCrud = createCrudSet(Metric, 'Metric');
export const getAllMetrics = metricCrud.getAll;
export const createMetric = metricCrud.create;
export const updateMetric = metricCrud.update;
export const deleteMetric = metricCrud.delete;

// Travel Info Handlers
const travelCrud = createCrudSet(TravelInfo, 'TravelInfo');
export const getAllTravelInfo = travelCrud.getAll;
export const createTravelInfo = travelCrud.create;
export const updateTravelInfo = travelCrud.update;
export const deleteTravelInfo = travelCrud.delete;

// Venue Gallery Handlers
const venueGalleryCrud = createCrudSet(VenueGallery, 'VenueGallery');
export const getAllVenueGallery = venueGalleryCrud.getAll;
export const createVenueGallery = venueGalleryCrud.create;
export const updateVenueGallery = venueGalleryCrud.update;
export const deleteVenueGallery = venueGalleryCrud.delete;

export const getVenueSettings = async (req, res) => {
    try {
        let venue = await VenueSetting.findOne();
        if (!venue) venue = await VenueSetting.create({});
        res.status(200).json(venue);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch venue info' }); }
};

export const updateVenueSettings = async (req, res) => {
    try {
        const venue = await VenueSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        await clearCache('*');
        res.status(200).json(venue);
    } catch (err) { res.status(500).json({ error: 'Failed to update venue info' }); }
};



// === USER MANAGEMENT ===

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Active', 'Suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.isActive = status === 'Active';
        await user.save();

        // Notify user of status change
        const statusMessage = status === 'Suspended' 
            ? 'Your account has been suspended. Please contact support.' 
            : 'Your account has been reactivated.';

        await sendEmail(
            user.email,
            `Account Status Update - Wisvora Scientific`,
            `<h1>Account Status Changed</h1><p>Hi ${user.firstName},</p><p>${statusMessage}</p>`
        );

        await clearCache('*');
        res.status(200).json({ message: `User status updated to ${status}.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user status.' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user.id === id) {
            return res.status(400).json({ error: 'Cannot delete your own account.' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.isActive = false;
        await user.save();

        await clearCache('*');
        res.status(200).json({ message: 'User account deactivated.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user.' });
    }
};

// === INVITATION SYSTEM ===

export const inviteUser = async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }

        // Check if a pending invitation exists
        const pendingInvitation = await Invitation.findOne({ email, status: 'pending' });
        if (pendingInvitation) {
            return res.status(400).json({ error: 'A pending invitation already exists for this email.' });
        }

        // Create invitation token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Expiration: 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invitation = await Invitation.create({
            email,
            role,
            token,
            invitedBy: req.user?._id || req.user?.id,
            expiresAt
        });

        // Send invitation email
        const registrationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/register-invitation?token=${token}`;
        
        await sendEmail(
            email,
            'Invitation to Join Wisvora Scientific Administration',
            `<h1>Admin Invitation</h1>
             <p>You have been invited to join the Wisvora Scientific platform as a <strong>${role}</strong>.</p>
             <p>Please click the link below to complete your registration:</p>
             <a href="${registrationUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #0ea5e9; text-decoration: none; border-radius: 5px;">Join Administration</a>
             <p>This link will expire in 7 days.</p>
             <p>If the button doesn't work, copy and paste this URL into your browser:</p>
             <p>${registrationUrl}</p>`
        );

        res.status(201).json({ message: 'Invitation sent successfully.', invitation });
    } catch (error) {
        console.error('Invite User Error:', error);
        res.status(500).json({ error: 'Failed to send invitation.' });
    }
};

export const getAllInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find()
            .populate('invitedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invitations.' });
    }
};

export const revokeInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const invitation = await Invitation.findById(id);

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found.' });
        }

        invitation.status = 'revoked';
        await invitation.save();

        res.status(200).json({ message: 'Invitation successfully revoked.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to revoke invitation.' });
    }
};

// === INBOX MANAGEMENT ===

export const getInboxMessages = async (req, res) => {
    try {
        const messages = await Submission.find({ type: 'contact' }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
};

export const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply_text } = req.body;

        if (!reply_text) {
            return res.status(400).json({ error: 'Reply text is required.' });
        }

        const message = await Submission.findById(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        message.status = 'Replied';
        message.message = reply_text; // Or add a reply field to Submission
        await message.save();

        // Send reply email
        await sendEmail(
            message.email,
            `Re: ${message.subject} - Wisvora Scientific`,
            `<h1>Response to Your Inquiry</h1>
             <p>Hi ${message.firstName},</p>
             <p>${reply_text}</p>
             <p>Best regards,<br>Wisvora Scientific Team</p>`
        );

        await clearCache('*');
        res.status(200).json({ message: 'Reply sent successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send reply.' });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        await Submission.findByIdAndDelete(id);

        await clearCache('*');
        res.status(200).json({ message: 'Message deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message.' });
    }
};

// === ABSTRACT REVIEW ===

export const getAllAbstracts = async (req, res) => {
    try {
        const abstracts = await Submission.find({ type: 'abstract' }).sort({ createdAt: -1 });
        res.status(200).json(abstracts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch abstracts.' });
    }
};

export const updateAbstractStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, review_comment } = req.body;

        // Validate status
        const validStatuses = ['Pending', 'Approved', 'Rejected', 'Revision'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const abstract = await Submission.findById(id);

        if (!abstract) {
            return res.status(404).json({ error: 'Abstract not found.' });
        }

        abstract.status = status;
        // abstract.review_comment = review_comment; 
        await abstract.save();

        // Send notification email
        const statusMessages = {
            'Approved': 'Your abstract has been APPROVED! Congratulations!',
            'Rejected': 'Your abstract has been REJECTED. Please contact us for feedback.',
            'Revision': 'Your abstract requires REVISION. Please review the comments below.',
            'Pending': 'Your abstract is under review.'
        };

        await sendEmail(
            abstract.email,
            `Abstract Review Status Update - Wisvora Scientific`,
            `<h1>Abstract Status: ${status}</h1>
             <p>Hi ${abstract.firstName},</p>
             <p>${statusMessages[status]}</p>
             <p><strong>Abstract Title:</strong> ${abstract.title}</p>
             ${review_comment ? `<p><strong>Reviewer Comments:</strong><br>${review_comment}</p>` : ''}
             <p>Best regards,<br>Wisvora Scientific Team</p>`
        );

        await clearCache('*');
        res.status(200).json({ message: 'Abstract status updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update abstract status.' });
    }
};

// === REGISTRATION MANAGEMENT ===

export const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find().sort({ createdAt: -1 });
        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
};

// === SITE SETTINGS MANAGEMENT ===

export const getSiteSettings = async (req, res) => {
    try {
        const settings = await SiteSetting.find({ group: 'general' });
        
        if (settings.length === 0) {
            return res.status(200).json({
                site_title: 'WISVORA PEAK 2026',
                site_tagline: 'Pioneering the future of Sustainable Materials',
                currency: '$',
                contact_email: 'contact@wisvorapeak.com',
                contact_phone: '+91 9366531405',
                contact_address: 'WISVORA PEAK PRIVATE LIMITED, Guwahati, Assam, India',
                office_hours: 'Mon - Fri: 09:00 - 18:00',
                twitter_url: 'https://twitter.com/wisvorapeak',
                linkedin_url: 'https://linkedin.com/company/wisvorapeak',
                facebook_url: 'https://facebook.com/wisvorapeak',
                instagram_url: 'https://instagram.com/wisvorapeak',
                is_maintenance_mode: false
            });
        }

        const settingsObj = {};
        settings.forEach(s => settingsObj[s.key] = s.value);
        res.status(200).json(settingsObj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch site settings.' });
    }
};

export const createSiteSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Settings object is required.' });
        }

        const bulkOps = Object.keys(settings).map(key => ({
            updateOne: {
                filter: { key },
                update: { key, value: settings[key], group: 'general' },
                upsert: true
            }
        }));

        await SiteSetting.bulkWrite(bulkOps);
        await clearCache('*');
        res.status(200).json({ message: 'Site settings updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save site settings.' });
    }
};

// SiteSettings logic typically uses POST to handle the whole object update
export const updateSiteSettings = createSiteSettings;


export const updateRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const reg = await Registration.findByIdAndUpdate(id, { payment_status: status }, { new: true });
        if (!reg) return res.status(404).json({ error: 'Registration not found' });
        await clearCache('*');
        res.status(200).json(reg);
    } catch (err) { res.status(500).json({ error: 'Failed to update status' }); }
};

export const deleteRegistration = async (req, res) => {
    try {
        await Registration.findByIdAndDelete(req.params.id);
        await clearCache('*');
        res.status(200).json({ message: 'Record removed' });
    } catch (err) { res.status(500).json({ error: 'Failed to delete record' }); }
};


// === ADMIN DASHBOARD STATS ===

export const getAdminStats = async (req, res) => {
    try {
        const usersCount = await User.countDocuments();
        const abstractsCount = await Submission.countDocuments({ type: 'abstract' });
        const contactsCount = await Submission.countDocuments({ type: 'contact' });
        const registrationsCount = await Registration.countDocuments();
        const sponsorsCount = await Sponsor.countDocuments();
        const speakersCount = await Speaker.countDocuments();
        const failedPaymentsCount = await FailedPayment.countDocuments();
        const pendingFailedPayments = await FailedPayment.countDocuments({ follow_up_status: 'Pending' });

        const registrations = await Registration.find().select('amount payment_status');
        const revenue = (registrations || []).reduce((acc, reg) => {
            if (reg.payment_status === 'Paid') return acc + (Number(reg.amount) || 0);
            return acc;
        }, 0);

        const abstracts = await Submission.find({ type: 'abstract' }).select('status');
        const statusBreakdown = {
            pending: abstracts?.filter(a => a.status === 'Pending').length || 0,
            approved: abstracts?.filter(a => a.status === 'Approved').length || 0,
            rejected: abstracts?.filter(a => a.status === 'Rejected').length || 0,
            revision: abstracts?.filter(a => a.status === 'Revision').length || 0
        };

        const recentInquiries = await Submission.find({ type: 'contact' })
            .sort({ createdAt: -1 })
            .limit(5);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const chartEntries = await Registration.find({
            createdAt: { $gte: sevenDaysAgo }
        }).select('createdAt');

        const chartData = Array(7).fill(0);
        chartEntries?.forEach(entry => {
            const day = new Date(entry.createdAt).getDay();
            const today = new Date().getDay();
            const index = (day - (today - 6) + 7) % 7;
            if (index >= 0 && index < 7) chartData[index]++;
        });

        res.status(200).json({
            totalUsers: usersCount,
            totalAbstracts: abstractsCount,
            totalInquiries: contactsCount,
            totalRegistrations: registrationsCount,
            totalSponsors: sponsorsCount,
            totalSpeakers: speakersCount,
            totalRevenue: `$${revenue.toLocaleString()}`,
            abstractStatusBreakdown: statusBreakdown,
            recentInquiries: recentInquiries || [],
            registrationChartData: chartData.map(v => Math.max(v * 20, 10)),
            failedPayments: failedPaymentsCount,
            pendingFailedPayments: pendingFailedPayments
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats.' });
    }
};


// === BULK EMAIL DISPATCH ===

export const sendBulkEmail = async (req, res) => {
    try {
        const { subject, content } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'CSV file is required.' });
        if (!subject || !content) return res.status(400).json({ error: 'Subject and content are required.' });

        const csvContent = file.buffer.toString('utf-8');
        const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l);

        if (lines.length < 2) return res.status(400).json({ error: 'CSV must contain at least a header and one data row.' });

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const nameIdx = headers.indexOf('name');
        const emailIdx = headers.indexOf('email');

        if (nameIdx === -1 || emailIdx === -1) {
            return res.status(400).json({ error: 'CSV headers must include "name" and "email".' });
        }

        let sent = 0;
        let failed = 0;
        const failedEmails = [];
        const records = lines.slice(1);

        for (const line of records) {
            const cols = line.split(',').map(c => c.trim());
            const name = cols[nameIdx];
            const email = cols[emailIdx];

            if (!email || !name) {
                failed++;
                continue;
            }

            // Simple template displacement
            const personalizedContent = content.replace(/\{\{name\}\}/gi, name);
            const personalizedHtml = `
                <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
                    ${personalizedContent.split('\n').map(p => `<p>${p}</p>`).join('')}
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 11px; color: #64748b; font-style: italic;">
                        This email was sent via the administrative gateway of ASFAA-2026.
                    </p>
                </div>
            `;

            const success = await sendEmail(
                email, 
                subject, 
                personalizedHtml, 
                `"ASFAA-2026 Technical Desk" <info@foodagriexpo.com>`
            );

            if (success) sent++;
            else {
                failed++;
                failedEmails.push(email);
            }
        }

        res.status(200).json({
            message: 'Bulk email dispatch protocol completed.',
            total: records.length,
            sent,
            failed,
            failedEmails
        });

    } catch (error) {
        console.error('Bulk Email Error:', error);
        res.status(500).json({ error: 'Critical failure during bulk dispatch.' });
    }
};

// === TOPIC MANAGEMENT ===
export const getAllTopics = async (req, res) => {
    try { res.status(200).json(await Topic.find().sort({ display_order: 1 })); }
    catch (err) { res.status(500).json({ error: 'Failed to fetch topics.' }); }
};
export const createTopic = async (req, res) => {
    try { const data = await Topic.create(req.body); await clearCache('*'); res.status(201).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to create topic.' }); }
};
export const updateTopic = async (req, res) => {
    try { const data = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true }); await clearCache('*'); res.status(200).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to update topic.' }); }
};
export const deleteTopic = async (req, res) => {
    try { await Topic.findByIdAndDelete(req.params.id); await clearCache('*'); res.status(200).json({ message: 'Topic deleted.' }); }
    catch (err) { res.status(500).json({ error: 'Failed to delete topic.' }); }
};

// === SPEAKER MANAGEMENT ===
export const getAllSpeakers = async (req, res) => {
    try { res.status(200).json(await Speaker.find().sort({ display_order: 1 })); }
    catch (err) { res.status(500).json({ error: 'Failed to fetch speakers.' }); }
};
export const createSpeaker = async (req, res) => {
    try { const data = await Speaker.create(req.body); await clearCache('*'); res.status(201).json(data); }
    catch (err) { 
        console.error('Speaker Create Terminal Collision:', err);
        res.status(500).json({ error: `Failed to create speaker: ${err.message}` }); 
    }
};
export const updateSpeaker = async (req, res) => {
    try { const data = await Speaker.findByIdAndUpdate(req.params.id, req.body, { new: true }); await clearCache('*'); res.status(200).json(data); }
    catch (err) { 
        console.error('Speaker Update Terminal Collision:', err);
        res.status(500).json({ error: `Failed to update speaker: ${err.message}` }); 
    }
};
export const deleteSpeaker = async (req, res) => {
    try { await Speaker.findByIdAndDelete(req.params.id); await clearCache('*'); res.status(200).json({ message: 'Speaker deleted.' }); }
    catch (err) { res.status(500).json({ error: 'Failed to delete speaker.' }); }
};

// === SPONSOR MANAGEMENT ===
export const getAllSponsors = async (req, res) => {
    try { res.status(200).json(await Sponsor.find().sort({ display_order: 1 })); }
    catch (err) { res.status(500).json({ error: 'Failed to fetch sponsors.' }); }
};
export const createSponsor = async (req, res) => {
    try { const data = await Sponsor.create(req.body); await clearCache('*'); res.status(201).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to create sponsor.' }); }
};
export const updateSponsor = async (req, res) => {
    try { const data = await Sponsor.findByIdAndUpdate(req.params.id, req.body, { new: true }); await clearCache('*'); res.status(200).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to update sponsor.' }); }
};
export const deleteSponsor = async (req, res) => {
    try { await Sponsor.findByIdAndDelete(req.params.id); await clearCache('*'); res.status(200).json({ message: 'Sponsor deleted.' }); }
    catch (err) { res.status(500).json({ error: 'Failed to delete sponsor.' }); }
};

// === BROCHURE MANAGEMENT ===
export const getAllBrochures = async (req, res) => {
    try { res.status(200).json(await Brochure.find().sort({ display_order: 1 })); }
    catch (err) { res.status(500).json({ error: 'Failed to fetch brochures.' }); }
};
export const createBrochure = async (req, res) => {
    try { const data = await Brochure.create(req.body); await clearCache('*'); res.status(201).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to create brochure.' }); }
};
export const updateBrochure = async (req, res) => {
    try { const data = await Brochure.findByIdAndUpdate(req.params.id, req.body, { new: true }); await clearCache('*'); res.status(200).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to update brochure.' }); }
};
export const deleteBrochure = async (req, res) => {
    try { await Brochure.findByIdAndDelete(req.params.id); await clearCache('*'); res.status(200).json({ message: 'Brochure deleted.' }); }
    catch (err) { res.status(500).json({ error: 'Failed to delete brochure.' }); }
};

// === PRICING MANAGEMENT ===
export const getAllPricing = async (req, res) => {
    try { res.status(200).json(await PricingTier.find().sort({ category: 1, display_order: 1 })); }
    catch (err) { res.status(500).json({ error: 'Failed to fetch pricing.' }); }
};
export const createPricing = async (req, res) => {
    try { const data = await PricingTier.create(req.body); await clearCache('*'); res.status(201).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to create pricing tier.' }); }
};
export const updatePricing = async (req, res) => {
    try { const data = await PricingTier.findByIdAndUpdate(req.params.id, req.body, { new: true }); await clearCache('*'); res.status(200).json(data); }
    catch (err) { res.status(500).json({ error: 'Failed to update pricing tier.' }); }
};
export const deletePricing = async (req, res) => {
    try { await PricingTier.findByIdAndDelete(req.params.id); await clearCache('*'); res.status(200).json({ message: 'Pricing tier deleted.' }); }
    catch (err) { res.status(500).json({ error: 'Failed to delete pricing tier.' }); }
};

// === SESSION MANAGEMENT ===
const sessionCrud = createCrudSet(Session, 'Session');
export const getAllSessions = sessionCrud.getAll;
export const createSession = sessionCrud.create;
export const updateSession = sessionCrud.update;
export const deleteSession = sessionCrud.delete;

// === IMPORTANT DATE MANAGEMENT ===
const importantDateCrud = createCrudSet(ImportantDate, 'ImportantDate');
export const getAllImportantDates = importantDateCrud.getAll;
export const createImportantDate = importantDateCrud.create;
export const updateImportantDate = importantDateCrud.update;
export const deleteImportantDate = importantDateCrud.delete;

// === FAILED PAYMENT MANAGEMENT ===

export const getAllFailedPayments = async (req, res) => {
    try {
        const failedPayments = await FailedPayment.find()
            .populate('followed_up_by', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json(failedPayments);
    } catch (err) {
        console.error('Fetch Failed Payments Error:', err);
        res.status(500).json({ error: 'Failed to fetch failed payments.' });
    }
};

export const updateFailedPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { follow_up_status, follow_up_notes } = req.body;

        const validStatuses = ['Pending', 'Contacted', 'Resolved', 'Abandoned'];
        if (follow_up_status && !validStatuses.includes(follow_up_status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const updateData = {};
        if (follow_up_status) updateData.follow_up_status = follow_up_status;
        if (follow_up_notes !== undefined) updateData.follow_up_notes = follow_up_notes;
        updateData.followed_up_by = req.user?._id || req.user?.id;
        updateData.followed_up_at = new Date();

        const record = await FailedPayment.findByIdAndUpdate(id, updateData, { new: true });
        if (!record) return res.status(404).json({ error: 'Failed payment record not found.' });

        await clearCache('*');
        res.status(200).json(record);
    } catch (err) {
        console.error('Update Failed Payment Error:', err);
        res.status(500).json({ error: 'Failed to update failed payment.' });
    }
};

export const deleteFailedPayment = async (req, res) => {
    try {
        await FailedPayment.findByIdAndDelete(req.params.id);
        await clearCache('*');
        res.status(200).json({ message: 'Failed payment record removed.' });
    } catch (err) {
        console.error('Delete Failed Payment Error:', err);
        res.status(500).json({ error: 'Failed to delete failed payment record.' });
    }
};
