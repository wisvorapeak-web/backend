import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER, // Your email
    pass: process.env.MAIL_PASS, // Your app password
  },
});

export const sendEmail = async (to, subject, html, from = null) => {
  try {
    const defaultFrom = `"Ascendix World Food, AgroTech & Animal Science" <${process.env.MAIL_USER}>`;
    const info = await transporter.sendMail({
      from: from || defaultFrom,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};
