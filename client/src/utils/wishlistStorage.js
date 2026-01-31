
const GUEST_WISHLIST_KEY = 'guest_wishlist';

// Get guest wishlist from localStorage
export const getGuestWishlist = () => {
  try {
    const wishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error getting guest wishlist:', error);
    return [];
  }
};

// Save guest wishlist to localStorage
export const saveGuestWishlist = (wishlist) => {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
    return true;
  } catch (error) {
    console.error('Error saving guest wishlist:', error);
    return false;
  }
};

// Add course to guest wishlist
export const addToGuestWishlist = (courseId) => {
  const wishlist = getGuestWishlist();
  if (!wishlist.includes(courseId)) {
    wishlist.push(courseId);
    saveGuestWishlist(wishlist);
  }
  return wishlist;
};

// Remove course from guest wishlist
export const removeFromGuestWishlist = (courseId) => {
  const wishlist = getGuestWishlist();
  const updatedWishlist = wishlist.filter(id => id !== courseId);
  saveGuestWishlist(updatedWishlist);
  return updatedWishlist;
};

// Check if course is in guest wishlist
export const isInGuestWishlist = (courseId) => {
  const wishlist = getGuestWishlist();
  return wishlist.includes(courseId);
};

// Get guest wishlist count
export const getGuestWishlistCount = () => {
  const wishlist = getGuestWishlist();
  return wishlist.length;
};

export const syncGuestWishlistToAccount = async (api) => {
  const guestWishlist = getGuestWishlist();
  
  if (guestWishlist.length > 0) {
    try {
      const promises = guestWishlist.map(courseId => 
        api.post('/wishlist', { courseId }).catch(() => null)
      );
      
      await Promise.all(promises);
      
      localStorage.removeItem(GUEST_WISHLIST_KEY);
      
      return {
        success: true,
        count: guestWishlist.length
      };
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      return {
        success: false,
        error: 'Failed to sync favorites'
      };
    }
  }
  
  return { success: true, count: 0 };
};