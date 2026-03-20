import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

/**
 * Setup Super Admin
 * POST /api/setup
 */
export const setupSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Remove setup authorization code check as requested

    // Check if any Super Admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'Admin')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0) {
      return res.status(400).json({ error: 'System already has an Admin. Setup phase is closed.' });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists in the system.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Super Admin
    const { data: admin, error: insertError } = await supabase
      .from('profiles')
      .insert([
        { 
          full_name: name, 
          email, 
          password: hashedPassword, 
          role: 'Admin',
          status: 'Active',
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      throw insertError;
    }

    res.status(201).json({
      message: 'Super Admin successfully initialized.',
      admin: {
        id: admin.id,
        name: admin.full_name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Setup Error:', error);
    res.status(500).json({ error: 'Initialization failed. Check server logs.' });
  }
};

/**
 * Check if setup is needed
 * GET /api/setup/status
 */
export const checkSetupStatus = async (req, res) => {
  try {
    const { data: admin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'Admin')
      .limit(1);

    const isSetupNeeded = !admin || admin.length === 0;

    res.json({ isSetupNeeded });
  } catch (error) {
    res.status(500).json({ error: 'System status check failed.' });
  }
};
