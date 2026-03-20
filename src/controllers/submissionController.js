import { supabase } from '../config/supabase.js';
import { sendEmail } from '../config/mailer.js';

export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required.' });
        }

        const { data, error } = await supabase
            .from('contacts')
            .insert([{ name, email, subject, message }]);

        if (error) throw error;

        // Send confirmation email
        await sendEmail(
            email,
            'Message Received - Polymers 2026',
            `<h1>Thank you for contacting us, ${name}!</h1><p>We have received your message regarding "${subject}" and will get back to you shortly.</p>`
        );

        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ error: 'Failed to submit contact form.' });
    }
};

export const submitAbstract = async (req, res) => {
    try {
        const { firstName, lastName, email, institution, topic, title, abstract } = req.body;
        const file = req.file;

        if (!email || !title || !abstract) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const { data, error } = await supabase
            .from('abstracts')
            .insert([{ 
                first_name: firstName, 
                last_name: lastName, 
                email, 
                institution, 
                topic, 
                title, 
                content: abstract,
                file_url: file ? file.path : null,
                status: 'pending'
            }]);

        if (error) throw error;

        // Send confirmation
        await sendEmail(
            email,
            'Abstract Submission Confirmation - Polymers 2026',
            `<h1>Submission Successful</h1><p>Dear ${firstName}, your abstract titled "${title}" has been successfully submitted and is under review.</p>`
        );

        res.status(200).json({ message: 'Abstract submitted successfully.' });
    } catch (error) {
        console.error('Abstract submission error:', error);
        res.status(500).json({ error: 'Failed to submit abstract.' });
    }
};

export const registerEvent = async (req, res) => {
    try {
        const { firstName, lastName, email, institution, country, ticketType } = req.body;

        if (!email || !ticketType) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const { data, error } = await supabase
            .from('registrations')
            .insert([{ 
                first_name: firstName, 
                last_name: lastName, 
                email, 
                institution, 
                country, 
                ticket_type: ticketType,
                payment_status: 'pending'
            }]);

        if (error) throw error;

        // Send confirmation
        await sendEmail(
            email,
            'Event Registration - Polymers 2026',
            `<h1>Registration Received</h1><p>Welcome ${firstName}! Your registration for ${ticketType} has been received. Please check your dashboard for payment instructions.</p>`
        );

        res.status(200).json({ message: 'Registration successful.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register.' });
    }
};
