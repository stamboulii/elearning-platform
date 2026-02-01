
import { protect } from '../middleware/auth.js';
import express from 'express';
import {
  validateCoupon,
  applyCoupon,
  getMyCouponUsage,
  useCoupon,
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getCouponStats,
  removeCoupon
} from '../controllers/couponController.js';


const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.post('/apply', protect, applyCoupon);
router.get('/usage/my', protect, getMyCouponUsage);
router.post('/use', protect, useCoupon);
router.delete('/remove', protect, removeCoupon);

router.post('/', protect, createCoupon);
router.get('/', protect, getAllCoupons);
router.get('/:id', protect, getCouponById);
router.put('/:id', protect, updateCoupon);
router.delete('/:id', protect, deleteCoupon);
router.get('/:id/stats', protect, getCouponStats);

export default router;