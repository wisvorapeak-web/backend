import Stripe from 'stripe';
import razorpay from 'razorpay';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import { sendEmail } from '../config/mailer.js';
import { templates } from '../utils/emailTemplates.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc');
const rzp = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret_placeholder',
});

export const createStripeIntent = async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }
    if (!currency) {
      return res.status(400).json({ error: 'Currency is required.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata: metadata || {},
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe Intent Error:', error);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const order = await rzp.orders.create({
      amount: Math.round(amount * 100),
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt || `receipt_${Date.now()}`,
    });
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order.' });
  }
};

export const recordTransaction = async (req, res) => {
  try {
    const { registration_id, payment_id, amount, currency, status, method, billing_details } = req.body;

    // Validate required fields
    if (!registration_id || !payment_id || !amount || !currency || !status || !method) {
      return res.status(400).json({ error: 'Missing required payment fields.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const registration = await Registration.findOne({ registrationId: registration_id });
    if (!registration) return res.status(404).json({ error: 'Registration not found.' });

    // Prevent duplicate payments
    if (registration.payment_status === 'Paid') {
      return res.status(409).json({ error: 'This registration has already been paid.' });
    }

    // Check for duplicate transaction ID
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

    if (status === 'Completed') {
        registration.payment_status = 'Paid';
        registration.transaction_id = payment_id;
        registration.payment_method = method;
        await registration.save();

        const fullName = `${registration.firstName} ${registration.lastName}`;
        await sendEmail(
            registration.email,
            'Payment Confirmation - ASFAA-2026',
            templates.paymentSuccess(fullName, amount, currency, payment_id, registration_id)
        );
    }

    res.status(201).json({ message: 'Transaction recorded and email dispatched', data: payment });
  } catch (error) {
    console.error('Record Transaction Error:', error);
    res.status(500).json({ error: 'Failed to record transaction.' });
  }
};

export const createPaypalOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const mockOrder = {
      id: `PAYPAL-MOCK-${Date.now()}`,
      status: 'CREATED',
      amount: amount,
      currency: (currency || 'USD').toUpperCase()
    };
    res.status(200).json(mockOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create PayPal order.' });
  }
};
