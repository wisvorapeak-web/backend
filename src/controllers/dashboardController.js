import { supabase } from '../config/supabase.js';

// Profile Handlers
export const getProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Profile not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal Error.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(req.body)
      .eq('id', req.user.id);

    if (error) return res.status(400).json({ error: 'Update failed.' });
    res.json({ message: 'Profile updated.', data });
  } catch (err) {
    res.status(500).json({ error: 'Internal Error.' });
  }
};

// Abstract Handlers
export const getAbstracts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('abstracts')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch abstracts.' });
  }
};

export const submitAbstract = async (req, res) => {
  try {
    const { title, event, type, fileUrl } = req.body;
    const { data, error } = await supabase
      .from('abstracts')
      .insert([{ 
        user_id: req.user.id, 
        title, 
        event, 
        type, 
        file_url: fileUrl, 
        status: 'Under Review' 
      }]);

    if (error) throw error;
    res.json({ message: 'Abstract submitted.', data });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed.' });
  }
};

// Registration Handlers
export const getRegistrations = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(title, location, date)')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
};

// Event Handlers
export const getEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

// Settings Handlers
export const getSettings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
};

export const getStats = async (req, res) => {
  try {
    const { count: abstractCount, error: abstractError } = await supabase
      .from('abstracts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    const { count: regCount, error: regError } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    res.json({
      registeredEvents: regCount || 0,
      submittedAbstracts: abstractCount || 0,
      professionalIndex: 8.4, 
      networkPoints: 450
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};
