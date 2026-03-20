import { supabase } from '../config/supabase.js';
import { clearCache } from '../middleware/cacheMiddleware.js';

export const getAllRegistrations = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registrations.' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};

export const getInboxMessages = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
};

export const getAllAbstracts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('abstracts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch abstracts.' });
    }
};

export const updateAbstractStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        const { data, error } = await supabase
            .from('abstracts')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        
        // Clear related caches
        await clearCache('*'); 

        res.status(200).json({ message: 'Status updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status.' });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: abstractsCount } = await supabase.from('abstracts').select('*', { count: 'exact', head: true });
        const { count: contactsCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
        
        // Sum revenue from registrations
        const { data: registrations } = await supabase.from('registrations').select('tier');
        const revenue = (registrations || []).reduce((acc, reg) => {
            // Very simple pricing logic based on tier names - adjust as needed
            if (reg.tier?.toLowerCase().includes('gold') || reg.tier?.toLowerCase().includes('platinum')) return acc + 1500;
            if (reg.tier?.toLowerCase().includes('premium')) return acc + 800;
            return acc + 400;
        }, 0);

        const { data: recentInquiries } = await supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(3);

        // Fetch chart data (registrations per day for last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: chartEntries } = await supabase
            .from('profiles')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());
        
        const chartData = Array(7).fill(0);
        chartEntries?.forEach(entry => {
            const day = new Date(entry.created_at).getDay();
            const today = new Date().getDay();
            const index = (day - (today - 6) + 7) % 7;
            if (index >= 0 && index < 7) chartData[index]++;
        });

        res.status(200).json({
            totalRegistrations: usersCount || 0,
            abstractsSubmitted: abstractsCount || 0,
            totalRevenue: `₹${revenue.toLocaleString()}`, 
            activeSessions: Math.floor(Math.random() * 20) + 5, 
            recentInquiries: recentInquiries || [],
            chartData: chartData.map(v => Math.max(v * 20, 10)) // Scale for visualization
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin stats.' });
    }
};

export const updateSiteSettings = async (req, res) => {
    try {
        const settings = req.body;
        // Strip id from settings to avoid updating it and force id: 1
        const { id, updated_at, ...updateData } = settings;
        
        const { data, error } = await supabase
            .from('site_settings')
            .update(updateData)
            .eq('id', 1); 

        if (error) throw error;
        
        await clearCache('*'); 
        res.status(200).json({ message: 'Site settings updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update site settings.' });
    }
};
