import express from 'express';
import {
  handlePaymentCancel,
  handlePaymentSuccess,
  processCheckout
} from '../controllers/CheckoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, processCheckout);


router.get('/success', handlePaymentSuccess);


router.get('/cancel', handlePaymentCancel);

export default router;