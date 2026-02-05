import transactionService from '../services/transactionService.js';

// @desc    Get all transactions with filters
// @route   GET /api/admin/transactions
// @access  Private (Admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await transactionService.getAllTransactions(
      filters,
      pagination
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/admin/transactions/stats
// @access  Private (Admin only)
export const getStatistics = async (req, res) => {
  try {
    const stats = await transactionService.getStatistics();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single transaction details
// @route   GET /api/admin/transactions/:id
// @access  Private (Admin only)
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id
    );

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    const statusCode = error.message === 'Transaction not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve offline payment
// @route   POST /api/admin/transactions/:id/approve
// @access  Private (Admin only)
export const approveOfflinePayment = async (req, res) => {
  try {
    const transaction = await transactionService.approveOfflinePayment(
      req.params.id
    );

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    const statusCode =
      error.message === 'Transaction not found'
        ? 404
        : error.message.includes('Only')
        ? 400
        : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Process refund
// @route   POST /api/admin/transactions/:id/refund
// @access  Private (Admin only)
export const refundTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.refundTransaction(
      req.params.id
    );

    res.json({
      success: true,
      message: 'Transaction refunded successfully',
      data: transaction,
    });
  } catch (error) {
    console.error('Refund transaction error:', error);
    const statusCode =
      error.message === 'Transaction not found'
        ? 404
        : error.message.includes('Only')
        ? 400
        : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/admin/transactions/export
// @access  Private (Admin only)
export const exportTransactions = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const csv = await transactionService.exportTransactions(filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${new Date().toISOString()}.csv`
    );
    res.send(csv);
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/transactions/analytics/revenue
// @access  Private (Admin only)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const period = req.query.period || '30days';
    const analytics = await transactionService.getRevenueAnalytics(period);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};