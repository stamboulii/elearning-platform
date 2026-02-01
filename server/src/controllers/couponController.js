import couponService from '../services/couponService.js';

// @desc    Create a new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit,
      applicableCourses,
      isActive,
    } = req.body;

    // Validation
    if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const coupon = await couponService.createCoupon({
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      usageLimit,
      applicableCourses,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating coupon',
      error: error.message,
    });
  }
};

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const { cartItems } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const validation = await couponService.validateCoupon(code, userId, cartItems || []);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    res.json({
      success: true,
      message: validation.message,
      data: {
        coupon: validation.coupon,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating coupon',
    });
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/coupons/apply
// @access  Private
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const { cartItems, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    if (!cartTotal) {
      return res.status(400).json({
        success: false,
        message: 'Cart total is required',
      });
    }

    const result = await couponService.applyCouponToCart(
      code,
      userId,
      cartItems || [],
      parseFloat(cartTotal)
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        coupon: result.coupon,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
      },
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying coupon',
    });
  }
};


export const removeCoupon = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        coupon: null,
        discountAmount: 0,
      },
    });
  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing coupon',
    });
  }
};



// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const filters = {
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      search: req.query.search,
    };

    const coupons = await couponService.getAllCoupons(filters);

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error('Get all coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
    });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponService.getCouponById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Get coupon by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon',
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const coupon = await couponService.updateCoupon(id, updateData);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating coupon',
      error: error.message,
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await couponService.deleteCoupon(id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
    });
  }
};

// @desc    Get coupon usage stats
// @route   GET /api/coupons/:id/stats
// @access  Private/Admin
export const getCouponStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await couponService.getCouponUsageStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching coupon stats',
    });
  }
};

// @desc    Get user's coupon usage history
// @route   GET /api/coupons/usage/my
// @access  Private
export const getMyCouponUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const usageHistory = await couponService.getUserCouponUsage(userId);

    res.json({
      success: true,
      data: usageHistory,
    });
  } catch (error) {
    console.error('Get my coupon usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupon usage history',
    });
  }
};

// @desc    Use coupon for transaction
// @route   POST /api/coupons/use
// @access  Private
export const useCoupon = async (req, res) => {
  try {
    const { couponId, transactionId } = req.body;
    const userId = req.user.id;

    if (!couponId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon ID and Transaction ID are required',
      });
    }

    const couponUsage = await couponService.useCoupon(couponId, userId, transactionId);

    res.json({
      success: true,
      message: 'Coupon used successfully',
      data: couponUsage,
    });
  } catch (error) {
    console.error('Use coupon error:', error);
    
    if (error.message.includes('Invalid coupon')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('usage limit')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error using coupon',
    });
  }
};