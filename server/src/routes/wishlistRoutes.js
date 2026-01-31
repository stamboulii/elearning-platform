import { protect } from '../middleware/auth.js';
import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlistStatus,
  getWishlistCount
} from '../controllers/wishlistController.js';

const router = express.Router();


router.post('/', protect, addToWishlist);

router.delete('/:courseId', protect,  removeFromWishlist);

router.get('/', protect, getWishlist);

router.get('/check/:courseId', protect, checkWishlistStatus);

router.get('/count', protect, getWishlistCount);

export default router;