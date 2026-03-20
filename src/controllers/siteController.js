import { supabase } from '../config/supabase.js';

export const getSiteSettings = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) {
             return res.status(200).json({
                id: 1,
                site_title: 'WISVORA PEAK 2026',
                site_tagline: 'Pioneering the future of Sustainable Materials',
                currency: '₹',
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
        res.status(200).json(data);
    } catch (error) {
        res.status(200).json({ site_title: 'WISVORA PEAK 2026' }); // Even safer
    }
};

export const getSpeakers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('speakers')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch speakers.' });
    }
};

export const getProgram = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('program_schedule')
            .select('*')
            .order('start_time', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch program.' });
    }
};

export const getDates = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('important_dates')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dates.' });
    }
};
