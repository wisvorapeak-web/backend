/**
 * Email Templates for Ascendix World Food, AgroTech & Animal Science
 */

const baseStyle = `
  font-family: 'Inter', 'Helvetica', Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const headerStyle = `
  background-color: #00113a;
  padding: 30px;
  text-align: center;
`;

const bodyStyle = `
  padding: 40px;
  background-color: #ffffff;
`;

const footerStyle = `
  background-color: #f8fafc;
  padding: 20px;
  text-align: center;
  font-size: 11px;
  color: #64748b;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #3898ec;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  margin-top: 20px;
`;

const logoLink = "https://www.foodagriexpo.com/logo.png"; // Replace with your actual hosted logo

export const layout = (content) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <img src="${logoLink}" alt="Ascendix World Food, AgroTech & Animal Science" style="height: 48px;">
    </div>
    <div style="${bodyStyle}">
      ${content}
    </div>
    <div style="${footerStyle}">
      <p>&copy; 2026 Ascendix World Food, AgroTech & Animal Science. All rights reserved.</p>
      <p>Uniting leaders, innovators, researchers, policymakers, and investors across the ecosystem.</p>
    </div>
  </div>
`;

export const templates = {
  // 0. Generic Success
  success: (title, message) => layout(`
    <h2 style="color: #00113a;">${title}</h2>
    <p>${message}</p>
  `),
  // 1. Welcome & OTP Verification
  verifyEmail: (name, otp) => layout(`
    <h2 style="color: #00113a;">Welcome to Ascendix, ${name}!</h2>
    <p>Thank you for joining our summit platform. Please use the following One-Time Password (OTP) to verify your email address:</p>
    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #3898ec;">${otp}</span>
    </div>
    <p>This code will expire in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
  `),

  // 2. Password Reset
  passwordReset: (name, otp, resetUrl) => layout(`
    <h2 style="color: #00113a;">Reset Your Password</h2>
    <p>Hi ${name}, we received a request to reset your password. Use the code below to proceed:</p>
    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #00113a;">${otp}</span>
    </div>
    <p>Or click the button below to go directly to the reset page:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
    </div>
    <p>This code expires in 30 minutes.</p>
  `),

  // 3. Abstract Submission Confirmation
  abstractReceived: (name, title, topic, submissionId) => layout(`
    <h2 style="color: #00113a;">Abstract Submission Confirmed</h2>
    <p>Dear ${name},</p>
    <p>We are pleased to inform you that your abstract has been successfully received and is now under technical review for ASFAA-2026.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #3898ec; padding: 20px; margin: 20px 0;">
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Submission ID:</strong> ${submissionId}</p>
    </div>
    <p>Our scientific committee will review your submission and notify you of the outcome within 7-10 business days.</p>
  `),

  // 4. Registration Confirmation
  registrationConfirmed: (name, ticketType, registrationId) => layout(`
    <h2 style="color: #00113a;">Registration Received</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering for the Ascendix World Food, AgroTech & Animal Science summit. Your registration details are listed below:</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #3898ec; padding: 20px; margin: 20px 0;">
      <p><strong>Ticket Type:</strong> ${ticketType}</p>
      <p><strong>Registration ID:</strong> ${registrationId}</p>
      <p><strong>Status:</strong> Pending Confirmation</p>
    </div>
    <p>You can complete your documentation and payment (if applicable) through the portal.</p>
    <div style="text-align: center;">
      <a href="https://www.foodagriexpo.com/registration" style="${buttonStyle}">View Portal</a>
    </div>
  `),

  // 5. Contact Form Acknowledgment
  contactAck: (name, subject) => layout(`
    <h2 style="color: #00113a;">We've Received Your Inquiry</h2>
    <p>Hi ${name},</p>
    <p>Thank you for reaching out to the ASFAA-2026 team. We have received your message regarding <strong>"${subject}"</strong>.</p>
    <p>One of our team members will review your inquiry and get back to you within 24-48 hours.</p>
  `),

  // 6. Payment Success
  paymentSuccess: (name, amount, currency, transactionId, registrationId) => layout(`
    <h2 style="color: #10b981;">Payment Confirmed!</h2>
    <p>Dear ${name},</p>
    <p>Your payment for the summit registration has been successfully processed. Welcome to ASFAA-2026!</p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p><strong>Amount Paid:</strong> ${currency} ${amount}</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p><strong>Registration ID:</strong> ${registrationId}</p>
      <p><strong>Status:</strong> Confirmed & Paid</p>
    </div>
    <p>Please keep this email as your official receipt. We look forward to seeing you in Singapore.</p>
    <p style="font-size: 13px; color: #64748b; margin-top: 20px;">For assistance, please contact our support team at contact@foodagriexpo.com</p>
  `)
};
