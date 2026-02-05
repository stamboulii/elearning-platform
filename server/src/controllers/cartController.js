import cartService from '../services/cartService.js';

export const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const result = await cartService.addToCart(userId, courseId);

    // Handle free course enrollment
    if (result.isFreeCourse) {
      return res.status(201).json({
        success: true,
        message: 'Enrolled in free course',
        data: {
          action: 'enrolled',
          enrollment: result.enrollment,
          cartItem: null,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course added to cart',
      data: {
        action: 'added',
        cartItem: result.cartItem
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);

    // Handle specific errors
    if (error.message === 'Course not found or not published') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'You already own this course') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Course already in cart') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    if (!cartItemId) {
      return res.status(400).json({
        success: false,
        message: 'Cart item ID is required',
      });
    }

    await cartService.removeFromCart(userId, cartItemId);

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);

    if (error.message === 'Cart item not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
    });
  }
};

export const removeFromCartByCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    await cartService.removeFromCartByCourse(userId, courseId);

    res.json({
      success: true,
      message: 'Course removed from cart',
    });
  } catch (error) {
    console.error('Remove from cart by course error:', error);

    if (error.message === 'Course not in cart') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await cartService.getUserCart(userId);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await cartService.clearCart(userId);

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
    });
  }
};

export const moveToWishlist = async (req, res) => {
  try {
    const { cartItemIds } = req.body;
    const userId = req.user.id;

    if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart item IDs are required and must be an array',
      });
    }

    const result = await cartService.moveToWishlist(userId, cartItemIds);

    res.json({
      success: true,
      message: `Moved ${result.movedToWishlist} item(s) to wishlist`,
      data: result,
    });
  } catch (error) {
    console.error('Move to wishlist error:', error);

    if (error.message === 'No cart items found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error moving to wishlist',
    });
  }
};

export const checkCartStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const cartStatus = await cartService.isInCart(userId, courseId);

    res.json({
      success: true,
      data: cartStatus,
    });
  } catch (error) {
    console.error('Check cart status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking cart status',
    });
  }
};

export const getCartCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await cartService.getCartCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting cart count',
    });
  }
};