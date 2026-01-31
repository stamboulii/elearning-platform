import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from '../../utils/toast';
import {useAuth} from '../../hooks/useAuth'
import { 
  addToGuestWishlist, 
  removeFromGuestWishlist, 
  isInGuestWishlist,
  syncGuestWishlistToAccount 
} from '../../utils/wishlistStorage';

const FavoriteButton = ({ courseId, size = 'md', showCount = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initialize favorite status
  useEffect(() => {
    const initializeFavoriteStatus = async () => {
      if (isAuthenticated && user) {
        // For authenticated users, check from API
        try {
          const response = await api.get(`/wishlist/check/${courseId}`);
          setIsFavorite(response.data?.data?.isInWishlist || false);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      } else {
        // For guest users, check from localStorage
        setIsFavorite(isInGuestWishlist(courseId));
      }
    };

    initializeFavoriteStatus();
  }, [courseId, isAuthenticated, user]);

  // Get wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/wishlist/count');
          setWishlistCount(response.data?.data?.count || 0);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
        }
      } else {
        // For guest users, count from localStorage
        const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        setWishlistCount(guestWishlist.length);
      }
    };

    fetchWishlistCount();
  }, [isFavorite, isAuthenticated]);

  // Sync guest wishlist when user logs in
  useEffect(() => {
    const syncWishlistOnLogin = async () => {
      if (isAuthenticated && user) {
        const result = await syncGuestWishlistToAccount(api, toast);
        if (result.success && result.count > 0) {
          toast.success(`✅ ${result.count} favorites synced to your account!`);
          // Re-check favorite status for current course
          try {
            const response = await api.get(`/wishlist/check/${courseId}`);
            setIsFavorite(response.data?.data?.isInWishlist || false);
          } catch (error) {
            console.error('Error re-checking wishlist:', error);
          }
        }
      }
    };

    syncWishlistOnLogin();
  }, [isAuthenticated, user, courseId]);

  const handleToggleFavorite = async () => {
    if (isLoading) return;

    // For guest users, redirect to login/signup or save locally
    if (!isAuthenticated) {
      const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      
      if (guestWishlist.includes(courseId)) {
        // Remove from guest wishlist
        removeFromGuestWishlist(courseId);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        // Add to guest wishlist
        addToGuestWishlist(courseId);
        setIsFavorite(true);
        
        // Show signup prompt after 2 favorites
        if (guestWishlist.length + 1 >= 2) {
          toast.custom(
            <div className="bg-white rounded-xl shadow-xl p-4 max-w-sm border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Heart className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Save your favorites permanently!</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Sign up to access your wishlist from any device.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        toast.dismiss();
                        navigate('/signup', { 
                          state: { 
                            from: window.location.pathname,
                            message: 'Create an account to save your favorites'
                          }
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Sign Up Free
                    </button>
                    <button
                      onClick={() => toast.dismiss()}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            {
              duration: 6000,
              position: 'bottom-center',
            }
          );
        } else {
          toast.success('Added to favorites!');
        }
      }
      return;
    }

    // For authenticated users, use API
    setIsLoading(true);
    const loadingToast = toast.loading(isFavorite ? 'Removing from favorites...' : 'Adding to favorites...');

    try {
      if (isFavorite) {
        await api.delete(`/wishlist/${courseId}`);
        setIsFavorite(false);
        toast.dismiss(loadingToast);
        toast.success('Removed from favorites');
      } else {
        await api.post('/wishlist', { courseId });
        setIsFavorite(true);
        toast.dismiss(loadingToast);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      
      if (error.response?.status === 409) {
        toast.error('Already in favorites');
        setIsFavorite(true);
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error('Please login to save favorites');
        navigate('/login', { state: { from: window.location.pathname } });
      } else {
        console.error('Error toggling favorite:', error);
        toast.error('Failed to update favorites');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`
          relative group flex items-center justify-center
          ${sizeClasses[size]} rounded-full
          transition-all duration-200
          ${isFavorite 
            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
            : 'bg-white/90 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }
          ${!isAuthenticated && isFavorite ? '!bg-blue-50 !text-blue-600 !border-blue-200' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
          backdrop-blur-sm
        `}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        title={!isAuthenticated && isFavorite ? "Saved locally - Sign in to save permanently" : ""}
      >
        {isLoading ? (
          <svg className={`${iconSizes[size]} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
            <Heart 
              className={`
                ${iconSizes[size]} transition-all duration-200
                ${isFavorite ? 'fill-current' : ''}
              `} 
            />
            {/* Guest indicator dot */}
            {!isAuthenticated && isFavorite && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
            )}
            {/* Pulse animation when favorited */}
            {isFavorite && (
              <span className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping"></span>
            )}
          </>
        )}
      </button>
      
      {showCount && wishlistCount > 0 && (
        <span className="text-sm font-medium text-slate-600">
          {wishlistCount}
        </span>
      )}
    </div>
  );
};

export default FavoriteButton;