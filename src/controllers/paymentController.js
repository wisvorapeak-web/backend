import Stripe from 'stripe';
import razorpay from 'razorpay';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import FailedPayment from '../models/FailedPayment.js';
import { sendEmail } from '../config/mailer.js';
import { templates } from '../utils/emailTemplates.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const rzp = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SXsv8FnDbmYYPi',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '2uuUVA9y0nmZ5RB3hNaPLRa1',
});

const normalizeCurrency = (curr) => {
    const map = { '$': 'USD', '₹': 'INR', '£': 'GBP', '€': 'EUR', 'S$': 'SGD' };
    if (!curr) return 'USD';
    const normalized = map[curr] || curr;
    // Handle both symbol and code
    return normalized.length >= 3 ? normalized.slice(0, 3).toUpperCase() : 'USD';
};

export const createStripeCheckoutSession = async (req, res) => {
  try {
    const { amount, currency, metadata, success_url, cancel_url } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: normalizeCurrency(currency).toLowerCase(),
            product_data: {
              name: metadata.tier_name || 'Summit Registration',
              description: `Payment for ASFAA-2026`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.CLIENT_URL}/payment`,
      metadata: metadata || {},
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ error: 'Failed to create Stripe checkout session.', details: error.message });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const order = await rzp.orders.create({
      amount: Math.round(amount * 100), // convert to paise
      currency: normalizeCurrency(currency),
      receipt: receipt || `receipt_${Date.now()}`,
    });
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Full Error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order.', details: error.message });
  }
};

export const recordTransaction = async (req, res) => {
  try {
    const { registration_id, payment_id, amount, currency, status, method, billing_details } = req.body;

    // Basic validation
    if (!payment_id || !amount || !currency || !status || !method) {
      return res.status(400).json({ error: 'Missing required payment fields.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    let registration = null;
    
    // 1. Try to find existing registration
    if (registration_id && registration_id !== 'null') {
        registration = await Registration.findOne({ registrationId: registration_id });
    }

    // 2. If not found and we have billing details, create a new one (Guest checkout)
    if (!registration && billing_details) {
        const nameParts = (billing_details.name || 'Guest User').split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '.';

        registration = await Registration.create({
            registrationId: `REG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            firstName,
            lastName,
            email: billing_details.email,
            institution: billing_details.institution,
            country: billing_details.country || 'Global',
            tier: billing_details.tier_name || 'Summit Pass',
            accommodation: billing_details.accommodation_tier,
            guest_addon: !!billing_details.guest_addon,
            amount: amount,
            status: 'Pending',
            payment_status: 'Unpaid'
        });
    }

    if (!registration) {
        return res.status(404).json({ error: 'Registration context not found and no billing details provided.' });
    }

    // Capture accommodation/guest info for existing registrations if provided in this payment session
    if (billing_details) {
        if (billing_details.accommodation_tier) registration.accommodation = billing_details.accommodation_tier;
        if (billing_details.guest_addon !== undefined) registration.guest_addon = !!billing_details.guest_addon;
    }

    // Prevent duplicate records for the same transaction ID
    const existingPayment = await Payment.findOne({ payment_id });
    if (existingPayment) {
      return res.status(409).json({ error: 'This transaction has already been recorded.' });
    }

    const payment = await Payment.create({
        registration_id: registration._id,
        payment_id,
        amount,
        currency,
        status,
        method,
        billing_details
    });

    if (status === 'Completed' || status === 'captured') {
        registration.payment_status = 'Paid';
        registration.transaction_id = payment_id;
        registration.payment_method = method;
        registration.amount = amount; // Ensure registration captures final amount
        registration.status = 'Confirmed';
        await registration.save();

        const fullName = `${registration.firstName} ${registration.lastName}`;
        await sendEmail(
            registration.email,
            'Payment Confirmation - ASFAA-2026',
            templates.paymentSuccess(fullName, amount, currency, payment_id, registration.registrationId)
        );
    }

    res.status(201).json({ message: 'Transaction recorded successfully', data: payment, registration_id: registration.registrationId });
  } catch (error) {
    console.error('Record Transaction Error:', error);
    res.status(500).json({ error: 'Failed to record transaction.', details: error.message });
  }
};

const getPaypalAccessToken = async () => {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`PayPal Auth Failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!data.access_token) throw new Error('PayPal Auth Token missing in response');
    return data.access_token;
};

export const createPaypalOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number.' });
        }

        const accessToken = await getPaypalAccessToken();
        
        const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: normalizeCurrency(currency),
                            value: amount.toFixed(2), // PayPal requires exactly 2 decimal places as string
                        },
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ 
                error: 'PayPal order creation failed.', 
                details: errData.message || 'Check your gateway credentials or currency support.' 
            });
        }

        const order = await response.json();
        res.status(200).json(order);
    } catch (error) {
        console.error('PayPal Order Error:', error);
        res.status(500).json({ error: 'Internal gateway error during PayPal order creation.', details: error.message });
    }
};

export const capturePaypalOrder = async (req, res) => {
    try {
        const { orderID } = req.body;
        if (!orderID) return res.status(400).json({ error: 'Order ID is required to capture payment.' });

        const accessToken = await getPaypalAccessToken();

        const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ 
                error: 'PayPal capture failed.', 
                details: errData.message || 'The payment could not be captured by PayPal.' 
            });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('PayPal Capture Error:', error);
        res.status(500).json({ error: 'Internal gateway error during PayPal capture.', details: error.message });
    }
};

// === RECORD FAILED PAYMENT ATTEMPTS ===
export const recordFailedPayment = async (req, res) => {
  try {
    const {
      name, email, phone, institution, country,
      tier_name, amount, currency, method,
      error_code, error_description, error_source, error_step,
      gateway_order_id, gateway_payment_id,
      registration_id
    } = req.body;

    // Basic validation
    if (!name || !email || !amount || !currency || !method) {
      return res.status(400).json({ error: 'Name, email, amount, currency, and method are required.' });
    }

    const failedPayment = await FailedPayment.create({
      name,
      email,
      phone,
      institution,
      country,
      tier_name,
      amount,
      currency,
      method,
      error_code,
      error_description: error_description || 'Unknown error',
      error_source: error_source || 'unknown',
      error_step: error_step || 'unknown',
      gateway_order_id,
      gateway_payment_id,
      registration_id,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip || req.connection?.remoteAddress
    });

    // Notify admin team via email
    const adminEmail = process.env.MAIL_USER || 'wisvorapeak@gmail.com';
    await sendEmail(
      adminEmail,
      `⚠️ Payment Failed - ${name} (${method.toUpperCase()})`,
      `<div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #dc2626;">Payment Failure Alert</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Name</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Email</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Amount</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${currency} ${amount}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Method</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${method}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Tier</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${tier_name || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Error</td><td style="padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;">${error_description || 'Unknown'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Error Code</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${error_code || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Institution</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${institution || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold; background: #f8fafc;">Country</td><td style="padding: 8px; border: 1px solid #e2e8f0;">${country || 'N/A'}</td></tr>
        </table>
        <p style="margin-top: 16px; color: #64748b; font-size: 13px;">Please contact this delegate to assist with completing their payment.</p>
        <p style="margin-top: 8px;"><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/failed-payments" style="color: #2563eb;">View in Admin Panel →</a></p>
      </div>`
    );

    console.log(`⚠️ Failed payment recorded: ${name} (${email}) — ${method} — ${error_description || 'Unknown'}`);

    res.status(201).json({ message: 'Failed payment recorded.', id: failedPayment._id });
  } catch (error) {
    console.error('Record Failed Payment Error:', error);
    res.status(500).json({ error: 'Failed to record payment failure.', details: error.message });
  }
};
