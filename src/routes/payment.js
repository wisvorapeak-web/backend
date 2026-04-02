import * as paymentController from '../controllers/paymentController.js';
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// All payment routes are public to allow delegates to pay for registration without mandatory user accounts
// router.use(authMiddleware);
// Stripe Payment
router.post('/stripe/checkout-session', paymentController.createStripeCheckoutSession);

// Razorpay Order
router.post('/razorpay/order', paymentController.createRazorpayOrder);

// PayPal Order
router.post('/paypal/order', paymentController.createPaypalOrder);
router.post('/paypal/capture', paymentController.capturePaypalOrder);

// Record Transaction
router.post('/record', paymentController.recordTransaction);

// Record Failed Payment Attempt (public — guests can fail too)
router.post('/record-failure', paymentController.recordFailedPayment);

export default router;
