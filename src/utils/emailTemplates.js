/**
 * Email Templates for Ascendix World Food, AgroTech & Animal Science
 */

const baseStyle = `
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #334155;
  background-color: #f1f5f9;
  padding: 40px 20px;
  -webkit-font-smoothing: antialiased;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const headerStyle = `
  background-color: #ffffff;
  padding: 32px 40px;
  text-align: center;
  border-bottom: 3px solid #f8fafc;
`;

const bodyStyle = `
  padding: 40px;
  background-color: #ffffff;
`;

const footerStyle = `
  background-color: #f8fafc;
  padding: 32px 40px;
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
`;

const buttonStyle = `
  display: inline-block;
  padding: 14px 28px;
  background-color: #2563eb;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 24px;
  text-align: center;
`;

const logoLink = "https://www.foodagriexpo.com/logo.png"; // Replace with your actual hosted logo

export const layout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ascendix Summit</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <div style="${baseStyle}">
    <div style="${containerStyle}">
      <div style="${headerStyle}">
        <img src="${logoLink}" alt="Ascendix World Food, AgroTech & Animal Science" style="height: 54px; max-width: 100%; object-fit: contain;">
      </div>
      <div style="${bodyStyle}">
        ${content}
      </div>
      <div style="${footerStyle}">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #475569;">&copy; 2026 Ascendix World Food, AgroTech & Animal Science.</p>
        <p style="margin: 0 0 15px 0;">Uniting leaders, innovators, researchers, policymakers, and investors across the ecosystem.</p>
        <div style="font-size: 12px; color: #94a3b8;">
          <a href="#" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> &nbsp;|&nbsp; 
          <a href="#" style="color: #94a3b8; text-decoration: underline;">Contact Support</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const templates = {
  // 0. Generic Success
  success: (title, message) => layout(`
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">${title}</h2>
    <p style="font-size: 16px; margin: 0; color: #475569;">${message}</p>
  `),
  
  // 1. Welcome & OTP Verification
  verifyEmail: (name, otp) => layout(`
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Welcome to Ascendix, ${name}!</h2>
    <p style="font-size: 16px; margin-bottom: 24px; color: #475569; line-height: 1.6;">Thank you for joining our summit platform. Please use the following One-Time Password (OTP) to verify your email address:</p>
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; margin: 30px 0;">
      <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #2563eb; display: block; margin-left: 12px;">${otp}</span>
    </div>
    <p style="font-size: 14px; color: #64748b; margin-top: 24px; text-align: center;">This code will expire in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
  `),

  // 2. Password Reset
  passwordReset: (name, otp, resetUrl) => layout(`
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Reset Your Password</h2>
    <p style="font-size: 16px; margin-bottom: 24px; color: #475569; line-height: 1.6;">Hi ${name}, we received a request to reset your password. Use the code below to proceed:</p>
    <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; margin: 30px 0;">
      <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0f172a; display: block; margin-left: 12px;">${otp}</span>
    </div>
    <p style="font-size: 16px; text-align: center; color: #475569; margin: 24px 0;">Or click the button below to go directly to the reset page:</p>
    <div style="text-align: center; margin-bottom: 30px;">
      <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #64748b; text-align: center;">This code expires in 30 minutes.</p>
  `),

  // 3. Abstract Submission Confirmation
  abstractReceived: (name, title, topic, submissionId) => layout(`
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Abstract Received</h2>
    <p style="font-size: 16px; margin-bottom: 20px; color: #475569;">Dear ${name},</p>
    <p style="font-size: 16px; margin-bottom: 24px; color: #475569; line-height: 1.6;">We are pleased to inform you that your abstract has been successfully received and is now under technical review for ASFAA-2026.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 24px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 12px 0; font-size: 15px;"><strong style="color: #0f172a;">Submission ID:</strong> <span style="color: #2563eb; font-weight: 600;">${submissionId}</span></p>
      <p style="margin: 0 0 12px 0; font-size: 15px;"><strong style="color: #0f172a;">Topic:</strong> ${topic}</p>
      <p style="margin: 0; font-size: 15px;"><strong style="color: #0f172a;">Title:</strong> ${title}</p>
    </div>
    <p style="font-size: 15px; color: #64748b; line-height: 1.6;">Our scientific committee will review your submission and notify you of the outcome within 7-10 business days.</p>
  `),

  // 4. Registration Confirmation
  registrationConfirmed: (name, ticketType, registrationId) => layout(`
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Registration Pending</h2>
    <p style="font-size: 16px; margin-bottom: 20px; color: #475569;">Hi ${name},</p>
    <p style="font-size: 16px; margin-bottom: 24px; color: #475569; line-height: 1.6;">Thank you for registering for the Ascendix World Food, AgroTech & Animal Science summit. Your registration details are listed below:</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 24px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 12px 0; font-size: 15px;"><strong style="color: #0f172a;">Registration ID:</strong> <span style="color: #2563eb; font-weight: 600;">${registrationId}</span></p>
      <p style="margin: 0 0 12px 0; font-size: 15px;"><strong style="color: #0f172a;">Ticket Type:</strong> ${ticketType}</p>
      <p style="margin: 0; font-size: 15px;"><strong style="color: #0f172a;">Status:</strong> <span style="color: #eab308; font-weight: 600;">Pending Confirmation</span></p>
    </div>
    <p style="font-size: 16px; color: #475569; text-align: center; margin-bottom: 24px;">You can complete your documentation and payment (if applicable) through the portal.</p>
    <div style="text-align: center;">
      <a href="https://www.foodagriexpo.com/registration" style="${buttonStyle}">View Portal</a>
    </div>
  `),

  // 5. Contact Form Acknowledgment
  contactAck: (name, subject) => layout(`
    <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Inquiry Received</h2>
    <p style="font-size: 16px; margin-bottom: 20px; color: #475569;">Hi ${name},</p>
    <p style="font-size: 16px; margin-bottom: 20px; color: #475569; line-height: 1.6;">Thank you for reaching out to the ASFAA-2026 team. We have received your message regarding:</p>
    <blockquote style="margin: 20px 0; padding: 20px; font-style: italic; background-color: #f8fafc; border-left: 4px solid #cbd5e1; color: #475569; border-radius: 0 8px 8px 0;">
      "${subject}"
    </blockquote>
    <p style="font-size: 16px; color: #475569; line-height: 1.6;">One of our team members will review your inquiry and get back to you within 24-48 hours.</p>
  `),

  // 6. Payment Success
  paymentSuccess: (name, amount, currency, transactionId, registrationId) => layout(`
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #dcfce7; border-radius: 50%; margin: 0 auto 16px;">
        <p style="color: #16a34a; font-size: 32px; font-weight: bold; margin: 0; line-height: 64px;">✓</p>
      </div>
      <h2 style="color: #16a34a; font-size: 28px; font-weight: 700; margin: 0;">Payment Confirmed!</h2>
    </div>
    <p style="font-size: 16px; margin-bottom: 20px; color: #475569;">Dear ${name},</p>
    <p style="font-size: 16px; margin-bottom: 24px; color: #475569; line-height: 1.6;">Your payment for the summit registration has been successfully processed. Welcome to ASFAA-2026!</p>
    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 24px; margin: 30px 0; border-radius: 12px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <tr>
          <td style="padding: 10px 0; color: #475569;"><strong>Amount Paid:</strong></td>
          <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0f172a;">${currency} ${amount}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #475569;"><strong>Transaction ID:</strong></td>
          <td style="padding: 10px 0; text-align: right; color: #0f172a;">${transactionId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0; color: #475569;"><strong>Registration ID:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #bbf7d0; text-align: right; color: #0f172a;">${registrationId}</td>
        </tr>
        <tr>
          <td style="padding: 14px 0 0; color: #475569;"><strong>Status:</strong></td>
          <td style="padding: 14px 0 0; text-align: right; color: #16a34a; font-weight: 700;">Confirmed & Paid</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 16px; margin-bottom: 20px; color: #475569;">Please keep this email as your official receipt. We look forward to seeing you in Singapore.</p>
    <p style="font-size: 14px; color: #64748b; margin-top: 30px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 20px;">For assistance, please contact our support team at <a href="mailto:contact@foodagriexpo.com" style="color: #2563eb; text-decoration: none;">contact@foodagriexpo.com</a></p>
  `)
};
