// routes/adminTransactionRoutes.js
import express from 'express';
import {
  getAllTransactions,
  getStatistics,
  getTransactionById,
  approveOfflinePayment,
  refundTransaction,
  exportTransactions,
  getRevenueAnalytics,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


/**
 * @route   GET /api/admin/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private (Admin only)
 */
router.get('/stats', protect, getStatistics);

/**
 * @route   GET /api/admin/transactions/export
 * @desc    Export transactions to CSV
 * @access  Private (Admin only)
 */
router.get('/export', protect, exportTransactions);

/**
 * @route   GET /api/admin/transactions/analytics/revenue
 * @desc    Get revenue analytics
 * @access  Private (Admin only)
 */
router.get('/analytics/revenue', protect, getRevenueAnalytics);

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions with filters
 * @access  Private (Admin only)
 */
router.get('/', protect, getAllTransactions);

/**
 * @route   GET /api/admin/transactions/:id
 * @desc    Get single transaction details
 * @access  Private (Admin only)
 */
router.get('/:id', protect, getTransactionById);

/**
 * @route   POST /api/admin/transactions/:id/approve
 * @desc    Approve offline payment
 * @access  Private (Admin only)
 */
router.post('/:id/approve', protect, approveOfflinePayment);

/**
 * @route   POST /api/admin/transactions/:id/refund
 * @desc    Process refund for transaction
 * @access  Private (Admin only)
 */
router.post('/:id/refund', protect, refundTransaction);

export default router;