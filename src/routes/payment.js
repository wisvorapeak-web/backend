import * as paymentController from '../controllers/paymentController.js';
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// All payment routes require authentication
router.use(authMiddleware);
// Stripe Payment
router.post('/stripe/intent', paymentController.createStripeIntent);

// Razorpay Order
router.post('/razorpay/order', paymentController.createRazorpayOrder);

// PayPal Order
router.post('/paypal/order', paymentController.createPaypalOrder);

// Record Transaction
router.post('/record', paymentController.recordTransaction);

export default router;
