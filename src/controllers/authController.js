import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { sendEmail } from '../config/mailer.js';
import client from '../config/redis.js';
import { validateEmail, validatePassword } from '../middleware/sanitizationMiddleware.js';

// --- HELPER: Create Auth Token ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// --- HELPER: Generate OTP ---
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// --- HELPER: Store OTP in Redis ---
const storeOTP = async (email, otp) => {
  try {
    // Store OTP with 10-minute expiration
    await client.setEx(`otp:${email}`, 600, otp);
    return true;
  } catch (err) {
    console.error('Redis OTP Storage Error:', err);
    return false;
  }
};

// --- HELPER: Verify OTP (internal helper) ---
const verifyStoredOTP = async (email, otp) => {
  try {
    const storedOTP = await client.get(`otp:${email}`);
    if (!storedOTP) {
      return { valid: false, message: 'OTP expired or not found.' };
    }
    if (storedOTP !== otp) {
      return { valid: false, message: 'Invalid OTP.' };
    }
    // Clear OTP after verification
    await client.del(`otp:${email}`);
    return { valid: true, message: 'OTP verified successfully.' };
  } catch (err) {
    console.error('Redis OTP Verification Error:', err);
    return { valid: false, message: 'System error verifying OTP.' };
  }
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role = 'User', institution, location } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.' 
      });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Create user in MongoDB
    const user = await User.create({ 
      firstName: name.split(' ')[0], 
      lastName: name.split(' ').slice(1).join(' ') || '.', 
      email, 
      password, 
      role: role.toLowerCase(), 
      isActive: true, // Default to Active
      registration_info: {
        institution,
        country: location
      }
    });

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpStored = await storeOTP(email, otp);

    if (otpStored) {
      // Send verification email
      await sendEmail(
        email,
        'Verify Your Email - Wisvora Scientific',
        `<h1>Welcome to Wisvora Scientific!</h1>
         <p>Hi ${name},</p>
         <p>Your OTP for email verification is: <strong>${otp}</strong></p>
         <p>This OTP will expire in 10 minutes.</p>
         <p>If you did not register for this account, please ignore this email.</p>`
      );
    }

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
      message: 'Registration successful. Please verify your email.',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      token,
      requiresEmailVerification: true
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Could not complete registration.' });
  }
};

/**
 * Register with Invitation Token
 * POST /api/auth/register-invitation
 */
export const registerWithInvitation = async (req, res) => {
  try {
    const { token, firstName, lastName, password, confirmPassword } = req.body;

    if (!token || !firstName || !lastName || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Find and validate invitation
    const invitation = await Invitation.findOne({ token, status: 'pending' });

    if (!invitation) {
      return res.status(400).json({ error: 'Invalid or expired invitation token.' });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ error: 'Invitation has expired.' });
    }

    // Check if user already exists (redundant but safe)
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      invitation.status = 'accepted';
      await invitation.save();
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: invitation.email,
      password,
      role: invitation.role,
      isActive: true
    });

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    // Generate Token
    const authToken = generateToken(user.id);

    // Set Cookie
    res.cookie('token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Account created successfully. Welcome to the administration team.',
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      token: authToken
    });

  } catch (error) {
    console.error('Invitation Registration Error:', error);
    res.status(500).json({ error: 'Failed to complete registration.' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account is suspended or inactive.' });
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
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
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
 * Get current logged-in user
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    // req.user is already set by authMiddleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    res.json({
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url || null,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ error: 'Could not fetch user profile.' });
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed.' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal whether email exists for security
      return res.status(200).json({ 
        message: 'If email exists, password reset instructions have been sent.' 
      });
    }

    // Generate temporary reset token (Expires in 10 minutes)
    const resetToken = jwt.sign(
      { email, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    // Send password reset email with direct link
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    await sendEmail(
      email,
      'Password Reset Request - Wisvora Scientific',
      `<h1>Password Reset Request</h1>
       <p>Hi ${user.firstName},</p>
       <p>You requested a password reset. Please click the button below to establish a new access key:</p>
       <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif;">Reset Password</a>
       <p>This secure link will expire in <strong>10 minutes</strong>.</p>
       <p>If you did not request this, please ignore this email or contact security if you have concerns.</p>
       <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
       <p style="font-size: 11px; color: #64748b;">If the button above does not work, copy and paste this link into your browser:<br>${resetUrl}</p>`
    );

    res.status(200).json({ 
      message: 'If email exists, password reset instructions have been sent.' 
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Could not process password reset request.' });
  }
};

/**
 * Verify OTP for Email or Password Reset
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type = 'email' } = req.body; // type: 'email' or 'password_reset'

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Verify OTP
    const result = await verifyStoredOTP(email, otp);
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    if (type === 'email') {
      // Mark email as verified in database (optional for MongoDB User model)
      await User.findOneAndUpdate({ email }, { isVerified: true });

      res.status(200).json({ message: 'Email verified successfully.' });
    } else {
      // For password reset, generate a temporary token
      const tempToken = jwt.sign(
        { email, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '30m' }
      );

      res.status(200).json({ 
        message: 'OTP verified. Proceed to reset password.',
        resetToken: tempToken
      });
    }

  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

/**
 * Reset Password with OTP
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.' 
      });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Verify reset token
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decoded.type !== 'password_reset' || decoded.email !== email) {
        return res.status(400).json({ error: 'Invalid reset token.' });
      }
    } catch (err) {
      return res.status(400).json({ error: 'Reset token expired or invalid.' });
    }

    // Check if new password is same as old password
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({ error: 'New password must be different from current password.' });
    }

    // Hash new password
    // Update password in database
    user.password = newPassword; 
    await user.save();

    // Send confirmation email
    await sendEmail(
      email,
      'Password Reset Successful - Wisvora Scientific',
      `<h1>Password Reset Successful</h1>
       <p>Your password has been successfully reset.</p>
       <p>If you did not make this change, please contact support immediately.</p>`
    );

    res.status(200).json({ message: 'Password reset successfully. Please log in with your new password.' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Could not reset password.' });
  }
};

/**
 * Resend OTP
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res) => {
  try {
    const { email, type = 'email' } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user && type === 'email') {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Generate and store new OTP
    const otp = generateOTP();
    const otpKey = type === 'password_reset' ? `password_reset:${email}` : `otp:${email}`;
    
    // Check rate limiting: max 3 resends per hour
    const resendKey = `resend_count:${otpKey}`;
    const resendCount = await client.get(resendKey);
    
    if (resendCount && parseInt(resendCount) >= 3) {
      return res.status(429).json({ error: 'Too many OTP resend attempts. Please try again later.' });
    }

    const otpStored = await storeOTP(email, otp);

    if (otpStored) {
      // Increment resend counter
      await client.incr(resendKey);
      await client.expire(resendKey, 3600); // 1 hour expiry

      // Send email based on type
      if (type === 'email') {
        await sendEmail(
          email,
          'Email Verification OTP - Wisvora Scientific',
          `<h1>Email Verification</h1>
           <p>Your OTP is: <strong>${otp}</strong></p>
           <p>This OTP will expire in 10 minutes.</p>`
        );
      } else {
        await sendEmail(
          email,
          'Password Reset OTP - Wisvora Scientific',
          `<h1>Password Reset</h1>
           <p>Your OTP is: <strong>${otp}</strong></p>
           <p>This OTP will expire in 10 minutes.</p>`
        );
      }
    }

    res.status(200).json({ message: 'OTP has been sent to your email.' });

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ error: 'Could not resend OTP.' });
  }
};
