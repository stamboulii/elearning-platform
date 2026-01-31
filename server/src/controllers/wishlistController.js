import wishlistService from '../services/wishlistService.js';

export const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const wishlistItem = await wishlistService.addToWishlist(userId, courseId);

    res.status(201).json({
      success: true,
      message: 'Course added to favorites',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Course already in favorites') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding to favorites'
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    await wishlistService.removeFromWishlist(userId, courseId);

    res.json({
      success: true,
      message: 'Course removed from favorites'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites'
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const wishlist = await wishlistService.getUserWishlist(userId, page, limit);

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites'
    });
  }
};

export const checkWishlistStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    const isInWishlist = await wishlistService.isInWishlist(userId, courseId);

    res.json({
      success: true,
      data: { isInWishlist }
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist status'
    });
  }
};

export const getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await wishlistService.getWishlistCount(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting favorites count'
    });
  }
};