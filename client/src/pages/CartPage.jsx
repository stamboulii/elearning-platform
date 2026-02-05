import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Heart, BookOpen, ChevronRight, Sparkles, CreditCard, Trash2, Star, Users, Clock, Tag, Percent, DollarSign } from 'lucide-react';
import api from '../services/api';
import toast from '../utils/toast';
import ConfirmModal from '../components/common/ConfirmModal';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], summary: {}, itemCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState({});
  const [movingToWishlist, setMovingToWishlist] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.data);

      // Check if there's an applied coupon in the response
      if (response.data.data.appliedCoupon) {
        setAppliedCoupon(response.data.data.appliedCoupon);
        setCouponCode(response.data.data.appliedCoupon.code);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      setRemovingItems(prev => ({ ...prev, [cartItemId]: true }));

      await api.delete(`/cart/${cartItemId}`);

      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== cartItemId),
        itemCount: prev.itemCount - 1
      }));

      toast.success('Removed from cart');
      window.dispatchEvent(new Event('cart-updated'));

      // Refresh cart to recalculate totals
      fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
    } finally {
      setRemovingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleMoveToWishlist = async (cartItemId) => {
    try {
      setMovingToWishlist(prev => ({ ...prev, [cartItemId]: true }));

      // Move to wishlist
      await api.post('/cart/move-to-wishlist', { cartItemIds: [cartItemId] });

      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== cartItemId),
        itemCount: prev.itemCount - 1
      }));

      toast.success('Moved to favorites');
      window.dispatchEvent(new Event('cart-updated'));
      window.dispatchEvent(new Event('favorites-updated'));

      // Refresh cart to recalculate totals
      fetchCart();
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast.error('Failed to move to favorites');
    } finally {
      setMovingToWishlist(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      setClearingCart(true);
      await api.delete('/cart');
      setCart({ items: [], summary: {}, itemCount: 0 });
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponDiscount(0);
      toast.success('Cart cleared');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setClearingCart(false);
      setShowClearModal(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setApplyingCoupon(true);

      // Prepare cart data for coupon validation
      const cartData = {
        code: couponCode,
        cartItems: cart.items.map(item => ({
          courseId: item.courseId,
          price: item.price,
          currentPrice: item.currentPrice,
        })),
        cartTotal: parseFloat(cart.summary.subtotal || 0)
      };

      // Apply coupon to cart
      const response = await api.post('/coupons/apply', cartData);

      if (response.data.success) {
        // Update the cart state with new totals
        setCart(prev => ({
          ...prev,
          summary: {
            ...prev.summary,
            couponDiscount: response.data.data.discountAmount,
            total: response.data.data.finalTotal
          }
        }));

        setAppliedCoupon(response.data.data.coupon);
        setCouponDiscount(response.data.data.discountAmount);

        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to apply coupon');
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const response = await api.delete('/coupons/remove');

      if (response.data.success) {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponDiscount(0);

        toast.success('Coupon removed');
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
      toast.error('Failed to remove coupon');
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Pass coupon info to checkout if available
    const checkoutData = {
      cartItems: cart.items,
      cartTotal: cart.summary.total,
      appliedCoupon: appliedCoupon ? {
        id: appliedCoupon.id,
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue
      } : null
    };

    // Store in sessionStorage or pass as state
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Calculate total with coupon
  const calculateTotalWithCoupon = () => {
    const subtotal = parseFloat(cart.summary.subtotal || 0);
    const tax = parseFloat(cart.summary.tax || 0);
    const total = subtotal + tax - couponDiscount;
    return total > 0 ? total : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded-2xl w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex gap-4">
                      <div className="h-24 w-32 bg-slate-200 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
                <p className="text-slate-500 mt-1 font-medium">
                  {cart.itemCount} course{cart.itemCount !== 1 ? 's' : ''} in your cart
                </p>
              </div>
            </div>

            {cart.items.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold border border-rose-200 hover:border-rose-300"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cart
              </button>
            )}
          </div>
        </div>

        {/* Cart Content */}
        {cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Course Thumbnail */}
                      <Link
                        to={`/courses/${item.courseId}`}
                        className="flex-shrink-0 w-48 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform"
                      >
                        {item.thumbnailImage ? (
                          <img
                            src={item.thumbnailImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                      </Link>

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/courses/${item.courseId}`}>
                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-slate-500 mb-3 line-clamp-2">
                          {item.shortDescription}
                        </p>

                        {/* Instructor */}
                        {item.instructor && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 overflow-hidden flex-shrink-0">
                              {item.instructor.profilePicture ? (
                                <img
                                  src={item.instructor.profilePicture}
                                  alt={item.instructor.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-bold">
                                  {item.instructor.name?.charAt(0) || 'I'}
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-slate-600">
                              {item.instructor.name}
                            </span>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-semibold">{item.avgRating || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{item.totalStudents || 0}</span>
                          </div>
                          {item.level && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg capitalize">
                              {item.level}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMoveToWishlist(item.id, item.courseId)}
                            disabled={movingToWishlist[item.id]}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold disabled:opacity-50"
                          >
                            {movingToWishlist[item.id] ? (
                              <>
                                <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                                Moving...
                              </>
                            ) : (
                              <>
                                <Heart className="w-4 h-4" />
                                Save for Later
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            disabled={removingItems[item.id]}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-semibold disabled:opacity-50"
                          >
                            {removingItems[item.id] ? (
                              <>
                                <div className="w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                                Removing...
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4" />
                                Remove
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          {item.discountPrice && item.price !== item.discountPrice ? (
                            <>
                              <div className="text-2xl font-black text-indigo-600">
                                {formatPrice(item.currentPrice)}
                              </div>
                              <div className="text-sm text-slate-400 line-through">
                                {formatPrice(item.price)}
                              </div>
                            </>
                          ) : (
                            <div className="text-2xl font-black text-slate-900">
                              {formatPrice(item.currentPrice)}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          disabled={removingItems[item.id]}
                          className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors group/remove"
                          title="Remove from cart"
                        >
                          <X className="w-5 h-5 group-hover/remove:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal ({cart.itemCount} items)</span>
                    <span className="font-semibold">{formatPrice(cart.summary.subtotal || 0)}</span>
                  </div>

                  {/* Course Discounts (if any) */}
                  {parseFloat(cart.summary.discount || 0) > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                      <span>Course Discount</span>
                      <span className="font-semibold">-{formatPrice(cart.summary.discount || 0)}</span>
                    </div>
                  )}

                  {/* COUPON DISCOUNT SECTION */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-emerald-600">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Coupon ({appliedCoupon.code})</span>
                      </div>
                      <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}

                  {parseFloat(cart.summary.tax || 0) > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tax</span>
                      <span className="font-semibold">{formatPrice(cart.summary.tax || 0)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-black text-indigo-600">
                        {formatPrice(calculateTotalWithCoupon())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ====== COUPON INPUT SECTION ====== */}
                <div className="mb-6 pt-6 border-t border-slate-100">
                  {appliedCoupon ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-100 rounded-lg">
                            <Tag className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-emerald-700">
                              Coupon Applied
                            </span>
                            <div className="text-sm text-emerald-600 font-mono">
                              {appliedCoupon.code}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-sm text-emerald-600">
                        {appliedCoupon.discountType === 'PERCENTAGE' ? (
                          <div className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            <span>Save {appliedCoupon.discountValue}% on applicable courses</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Save ${appliedCoupon.discountValue} on applicable courses</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                        >
                          {applyingCoupon ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="hidden sm:inline">Applying...</span>
                            </div>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Have a coupon? Enter it above to save on your purchase.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full group/checkout relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all py-4 px-6 shadow-lg shadow-indigo-200 hover:shadow-xl mb-4"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                    <ChevronRight className="w-5 h-5 group-hover/checkout:translate-x-1 transition-transform" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 translate-y-full group-hover/checkout:translate-y-0 transition-transform duration-300"></span>
                </button>

                <Link
                  to="/courses"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-semibold"
                >
                  <BookOpen className="w-5 h-5" />
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="text-center text-sm text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700">✓ 30-Day Money-Back Guarantee</p>
                    <p>✓ Lifetime Access</p>
                    <p>✓ Certificate of Completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Empty Cart State
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full mb-8">
              <ShoppingCart className="w-12 h-12 text-indigo-400" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h3>
            <p className="text-slate-500 mb-8 text-lg max-w-md mx-auto">
              Looks like you haven't added any courses to your cart yet. Start exploring and find your next learning adventure!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="group/browse inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 group-hover/browse:scale-110 transition-transform" />
                Browse Courses
                <ChevronRight className="w-5 h-5 group-hover/browse:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/wishlist"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <Heart className="w-5 h-5" />
                View Favorites
              </Link>
            </div>

            {/* Quick Categories */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-4">Popular categories:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Web Development', 'Data Science', 'Business', 'Design', 'Marketing', 'Photography'].map((category) => (
                  <Link
                    key={category}
                    to={`/courses?category=${encodeURIComponent(category)}`}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCart}
        title="Clear Shopping Cart?"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Yes, Clear Cart"
        cancelText="Keep Items"
        type="danger"
        isLoading={clearingCart}
      />
    </div>
  );
};

export default CartPage;