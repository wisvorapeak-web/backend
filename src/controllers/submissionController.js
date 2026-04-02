import Submission from '../models/Submission.js';
import Registration from '../models/Registration.js';
import Topic from '../models/Topic.js';
import { sendEmail } from '../config/mailer.js';
import { validateEmail, validateLength, validateRequired, validatePhone } from '../middleware/sanitizationMiddleware.js';
import crypto from 'crypto';

export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        const nameErrors = validateLength(name, 2, 100, 'Name');
        const subjectErrors = validateLength(subject, 3, 200, 'Subject');
        const messageErrors = validateLength(message, 10, 5000, 'Message');

        if (nameErrors.length > 0 || subjectErrors.length > 0 || messageErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: [...nameErrors, ...subjectErrors, ...messageErrors]
            });
        }

        const submissionId = `CON-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const submission = await Submission.create({ 
            type: 'contact',
            firstName: name.split(' ')[0], 
            lastName: name.split(' ').slice(1).join(' ') || '.', 
            email: email.toLowerCase(), 
            subject: subject.trim(), 
            message: message.trim(),
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
        const { firstName, lastName, email, institution, topic, category, title, abstract } = req.body;
        const file = req.file;

        // Validation
        if (!firstName || !lastName || !email || !topic || !category || !title || !abstract) {
            return res.status(400).json({ error: 'All required fields must be filled.' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        const nameErrors = [...validateLength(firstName, 2, 50, 'First Name'), ...validateLength(lastName, 2, 50, 'Last Name')];
        const titleErrors = validateLength(title, 10, 500, 'Title');
        const abstractErrors = validateLength(abstract, 100, 5000, 'Abstract');

        if (nameErrors.length > 0 || titleErrors.length > 0 || abstractErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: [...nameErrors, ...titleErrors, ...abstractErrors]
            });
        }

        // Validate topic against dynamic Topics collection
        const existingTopics = await Topic.find({ is_active: true }).select('title');
        const validTopics = existingTopics.map(t => t.title);
        if (!validTopics.includes(topic)) {
            return res.status(400).json({ error: `Invalid topic. Must be one of: ${validTopics.join(', ')}` });
        }

        const submissionId = `ABS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const data = await Submission.create({ 
            type: 'abstract',
            firstName: firstName.trim(), 
            lastName: lastName.trim(), 
            email: email.toLowerCase(), 
            institution: institution?.trim() || null, 
            topic, 
            category,
            title: title.trim(), 
            abstract: abstract.trim(),
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
        res.status(500).json({ error: 'Failed to submit abstract.' });
    }
};

export const registerEvent = async (req, res) => {
    try {
        const { firstName, lastName, email, institution, country, ticketType, phone } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !ticketType) {
            return res.status(400).json({ error: 'Required fields: firstName, lastName, email, ticketType.' });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        const nameErrors = [...validateLength(firstName, 2, 50, 'First Name'), ...validateLength(lastName, 2, 50, 'Last Name')];
        if (nameErrors.length > 0) {
            return res.status(400).json({ error: 'Validation failed', details: nameErrors });
        }

        // Validate country
        if (!country || country.trim().length < 2) {
            return res.status(400).json({ error: 'Country is required.' });
        }

        // Validate phone if provided
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format.' });
        }

        // Validate ticket type
        const validTickets = ['Student', 'Delegate', 'Speaker', 'Poster'];
        if (!validTickets.includes(ticketType)) {
            return res.status(400).json({ error: `Invalid ticket type. Must be one of: ${validTickets.join(', ')}` });
        }

        const registrationId = `REG-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const data = await Registration.create({ 
            firstName: firstName.trim(), 
            lastName: lastName.trim(), 
            email: email.toLowerCase(), 
            institution: institution?.trim() || null, 
            country: country.trim(),
            phone: phone?.trim() || null,
            tier: ticketType,
            status: 'Pending',
            registrationId
        });
        
        // No need for error throw as Registration.create will throw if schema fails

        // Send confirmation email
        const paymentUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/registration/${ticketType.toLowerCase()}?regId=${data.registrationId}`;

        await sendEmail(
            email,
            'Event Registration Confirmation - ASFAA-2026',
            `<h1>Registration Successful!</h1>
             <p>Hi ${firstName},</p>
             <p>Your registration for the Wisvora Scientific Platform has been received.</p>
             <p><strong>Registration Details:</strong><br>
             Ticket Type: ${ticketType}<br>
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
