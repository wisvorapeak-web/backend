import Submission from '../models/Submission.js';
import Registration from '../models/Registration.js';
import Topic from '../models/Topic.js';
import { sendEmail } from '../config/mailer.js';
import { validateSubmission, sanitizeData } from '../utils/validation.js';
import crypto from 'crypto';

export const submitContact = async (req, res) => {
    try {
        const { isValid, errors } = validateSubmission('contact', req.body);
        if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

        const sanitized = sanitizeData(req.body);
        const { name, email, subject, message } = sanitized;

        const submissionId = `CON-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const submission = await Submission.create({ 
            type: 'contact',
            firstName: name.split(' ')[0], 
            lastName: name.split(' ').slice(1).join(' ') || '.', 
            email: email.toLowerCase(), 
            subject: subject, 
            message: message,
            status: 'Pending',
            submissionId
        });

        // Send confirmation email
        await sendEmail(
            email,
            'Thank You - We Received Your Message - Wisvora Scientific',
            `<h1>Thank you for contacting us!</h1>
             <p>Hi ${name},</p>
             <p>We have received your message regarding "${subject}" and will get back to you within 24-48 hours.</p>
             <p>Best regards,<br>Wisvora Scientific Team</p>`
        );

        res.status(200).json({ message: 'Message sent successfully. We will respond within 24-48 hours.' });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ error: 'Failed to submit contact form.' });
    }
};

export const submitAbstract = async (req, res) => {
    try {
        const { isValid, errors } = validateSubmission('abstract', req.body);
        if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

        const sanitized = sanitizeData(req.body);
        const { firstName, lastName, email, institution, topic, category, title, abstract } = sanitized;
        const file = req.file;

        // Validate topic against dynamic Topics collection
        const existingTopics = await Topic.find({ is_active: true }).select('title');
        const validTopics = existingTopics.map(t => t.title);
        if (!validTopics.includes(topic)) {
            return res.status(400).json({ error: `Invalid topic selection. Please pick a valid conference topic.` });
        }

        const submissionId = `ABS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const data = await Submission.create({ 
            type: 'abstract',
            firstName: firstName, 
            lastName: lastName, 
            email: email.toLowerCase(), 
            institution: institution || null, 
            topic, 
            category,
            title: title, 
            abstract: abstract,
            file_url: file ? file.path : null,
            status: 'Pending',
            submissionId
        });

        // Send confirmation email
        await sendEmail(
            email,
            'Abstract Submission Confirmation - Wisvora Scientific',
            `<h1>Submission Successful!</h1>
             <p>Dear ${firstName},</p>
             <p>Your abstract titled "<strong>${title}</strong>" has been successfully submitted and is now under review.</p>
             <p><strong>Submission Details:</strong><br>
             Topic: ${topic}<br>
             Category: ${category}<br>
             Institution: ${institution || 'N/A'}<br>
             Submission ID: ${data.submissionId}</p>
             <p>You will receive updates on the review status via email within 7-10 days.</p>
             <p>Best regards,<br>Wisvora Scientific Team</p>`
        );

        res.status(201).json({ 
            message: 'Abstract submitted successfully. You will receive updates within 7-10 days.',
            abstractId: data.submissionId
        });
    } catch (error) {
        console.error('Abstract submission error:', error);
        res.status(500).json({ error: 'Critical failure during abstract submission.' });
    }
};

export const registerEvent = async (req, res) => {
    try {
        const { isValid, errors } = validateSubmission('registration', req.body);
        if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

        const sanitized = sanitizeData(req.body);
        const { firstName, lastName, email, institution, country, tier, phone } = sanitized;

        const registrationId = `REG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const data = await Registration.create({ 
            firstName, 
            lastName, 
            email: email.toLowerCase(), 
            institution: institution || null, 
            country,
            phone: phone || null,
            tier,
            status: 'Pending',
            registrationId
        });
        
        // Send confirmation email
        const paymentUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/registration/${tier.toLowerCase()}?regId=${data.registrationId}`;

        await sendEmail(
            email,
            'Event Registration Confirmation - ASFAA-2026',
            `<h1>Registration Successful!</h1>
             <p>Hi ${firstName},</p>
             <p>Your registration for the Wisvora Scientific Platform has been received.</p>
             <p><strong>Registration Details:</strong><br>
             Ticket Type: ${tier}<br>
             Institution: ${institution || 'N/A'}<br>
             Country: ${country}<br>
             Registration ID: ${data.registrationId}</p>
             <p><strong>Next Step:</strong> Please proceed to our secure payment gateway to confirm your seat:</p>
             <div style="margin: 30px 0;">
                <a href="${paymentUrl}" style="display: inline-block; padding: 14px 28px; color: white; background-color: #3898ec; text-decoration: none; border-radius: 8px; font-weight: bold;">Complete Secure Payment</a>
             </div>
             <p>If the button doesn't work, copy and paste this URL into your browser:</p>
             <p>${paymentUrl}</p>
             <p>Best regards,<br>Wisvora Scientific Team</p>`
        );

        res.status(201).json({ 
            message: 'Registration successful. Please proceed to payment.',
            registrationId: data.registrationId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register for event.' });
    }
};

export const submitBrochureRequest = async (req, res) => {
    try {
        const { isValid, errors } = validateSubmission('brochure', req.body);
        if (!isValid) return res.status(400).json({ error: 'Validation failed', details: errors });

        const sanitized = sanitizeData(req.body);
        const { firstName, lastName, email, phone, institution } = sanitized;

        const submissionId = `BRO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        await Submission.create({ 
            type: 'brochure',
            firstName, 
            lastName, 
            email: email.toLowerCase(), 
            phone: phone || null,
            institution: institution || null,
            status: 'Approved', // Mark as approved since they get the brochure immediately
            submissionId
        });

        // Optional: Send a follow-up email
        await sendEmail(
            email,
            'Brochure Downloaded - Wisvora Scientific',
            `<h1>Thank you for your interest!</h1>
             <p>Hi ${firstName},</p>
             <p>We've recorded your interest in our conference brochure. If you have any questions, feel free to reach out.</p>
             <p>Best regards,<br>Wisvora Scientific Team</p>`
        ).catch(err => console.error('Failed to send brochure email:', err));

        res.status(200).json({ message: 'Request recorded successfully.' });
    } catch (error) {
        console.error('Brochure request error:', error);
        res.status(500).json({ error: 'Failed to process brochure request.' });
    }
};
