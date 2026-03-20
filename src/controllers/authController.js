import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

// --- HELPER: Create Auth Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, institution, location } = req.body;

    // Check if user already exists in Auth or Users table
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash the password for manual storage (or let Supabase handle if using Auth)
    // But since they want "session based JWT auth", we'll manage user records.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in Auth (Supabase) + Profile
    // Or just create in a 'users' table if bypassing Supabase Auth completely.
    // For now, let's create a record in 'profiles' with a password field.
    const { data: user, error } = await supabase
      .from('profiles')
      .insert([
        { 
          full_name: name, 
          email, 
          password: hashedPassword, 
          role, 
          institution, 
          location,
          status: 'Active',
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Generate Token
    const token = generateToken(user.id);

    // Set HTTP-Only Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful.',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Could not complete registration.' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate Token
    const token = generateToken(user.id);

    // Set Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.json({ message: 'Logged out successfully.' });
};
