import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Registration from '../models/Registration.js';

// Profile Handlers
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Profile not found.' });
    res.json(user);
  } catch (err) {
    console.error('getProfile Error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Only allow certain fields to be updated
    const { firstName, lastName, avatar_url, registration_info } = req.body;
    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (avatar_url) updates.avatar_url = avatar_url;
    if (registration_info) updates.registration_info = registration_info;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(400).json({ error: 'Update failed.' });
    res.json({ message: 'Profile updated.', data: user });
  } catch (err) {
    console.error('updateProfile Error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Abstract Handlers
export const getAbstracts = async (req, res) => {
  try {
    const submissions = await Submission.find({ email: req.user.email, type: 'abstract' }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error('getAbstracts Error:', err);
    res.status(500).json({ error: 'Failed to fetch abstracts.' });
  }
};

export const submitAbstract = async (req, res) => {
  try {
    const { title, event, type, fileUrl } = req.body;
    const submission = await Submission.create({ 
        type: 'abstract',
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        title, 
        topic: event,
        abstract: type,
        file_url: fileUrl, 
        status: 'Pending',
        submissionId: `ABS-${Date.now().toString(36).toUpperCase()}`
    });
    res.json({ message: 'Abstract submitted.', data: submission });
  } catch (err) {
    console.error('submitAbstract Error:', err);
    res.status(500).json({ error: 'Submission failed.' });
  }
};

// Registration Handlers
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ email: req.user.email });
    res.json(registrations);
  } catch (err) {
    console.error('getRegistrations Error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations.' });
  }
};

// Event Handlers
export const getEvents = async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

// Settings Handlers
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('registration_info');
    res.json(user?.registration_info || {});
  } catch (err) {
    console.error('getSettings Error:', err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
};

export const getStats = async (req, res) => {
  try {
    const abstractCount = await Submission.countDocuments({ email: req.user.email, type: 'abstract' });
    const regCount = await Registration.countDocuments({ email: req.user.email });

    res.json({
      registeredEvents: regCount || 0,
      submittedAbstracts: abstractCount || 0,
      professionalIndex: 8.4, 
      networkPoints: 450
    });
  } catch (err) {
    console.error('getStats Error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};
