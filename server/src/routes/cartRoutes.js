import { protect } from '../middleware/auth.js';
import express from 'express';
import {
  addToCart,
  removeFromCart,
  removeFromCartByCourse,
  getCart,
  clearCart,
  moveToWishlist,
  checkCartStatus,
  getCartCount,
} from '../controllers/cartController.js';

const router = express.Router();

// @route   POST /api/cart
// @desc    Add course to cart
// @access  Private
router.post('/', protect, addToCart);

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', protect, clearCart);

// @route   DELETE /api/cart/:cartItemId
// @desc    Remove item from cart by cart item ID
// @access  Private
router.delete('/:cartItemId', protect, removeFromCart);

// @route   DELETE /api/cart/remove/course
// @desc    Remove item from cart by course ID
// @access  Private
router.delete('/remove/course', protect, removeFromCartByCourse);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, getCart);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, clearCart);

// @route   POST /api/cart/move-to-wishlist
// @desc    Move cart items to wishlist
// @access  Private
router.post('/move-to-wishlist', protect, moveToWishlist);

// @route   GET /api/cart/check/:courseId
// @desc    Check if course is in cart
// @access  Private
router.get('/check/:courseId', protect, checkCartStatus);

// @route   GET /api/cart/count
// @desc    Get cart item count
// @access  Private
router.get('/count', protect, getCartCount);

export default router;