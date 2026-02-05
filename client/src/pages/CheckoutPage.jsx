import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  ShoppingBag, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader,
  DollarSign,
  Tag
} from 'lucide-react';
import api from '../services/api';
import toast from '../utils/toast';

const CheckoutPage = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'offline'
  const navigate = useNavigate();

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = () => {
    try {
      const data = sessionStorage.getItem('checkoutData');
      if (!data) {
        toast.error('No checkout data found');
        navigate('/cart');
        return;
      }

      const parsed = JSON.parse(data);
      setCheckoutData(parsed);
      setLoading(false);
    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Failed to load checkout data');
      navigate('/cart');
    }
  };

  const handleCheckout = async () => {
    if (!checkoutData) {
      toast.error('No checkout data available');
      return;
    }

    try {
      setProcessing(true);

      // Prepare checkout request
      const checkoutRequest = {
        cartItems: checkoutData.cartItems.map(item => ({
          courseId: item.courseId,
          price: item.price,
          currentPrice: item.currentPrice,
        })),
        appliedCoupon: checkoutData.appliedCoupon,
        paymentMethod: paymentMethod
      };

      // Call checkout API
      const response = await api.post('/checkout', checkoutRequest);

      if (response.data.success) {
        if (paymentMethod === 'stripe') {
          // Redirect to Stripe checkout
          window.location.href = response.data.data.sessionUrl;
        } else {
          // Offline payment - show success message
          toast.success(response.data.message);
          sessionStorage.removeItem('checkoutData');
          navigate('/courses/my-courses');
        }
      } else {
        toast.error(response.data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to process checkout');
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return null;
  }

  const subtotal = parseFloat(checkoutData.cartTotal || 0);
  const couponDiscount = checkoutData.appliedCoupon 
    ? (checkoutData.appliedCoupon.discountType === 'PERCENTAGE'
        ? (subtotal * parseFloat(checkoutData.appliedCoupon.discountValue)) / 100
        : parseFloat(checkoutData.appliedCoupon.discountValue))
    : 0;
  const total = subtotal - couponDiscount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Checkout
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Complete your purchase
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Stripe Payment */}
                <label className={`
                  flex items-center gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all
                  ${paymentMethod === 'stripe' 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-200 hover:border-slate-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                      <span className="font-bold text-slate-900">
                        Credit/Debit Card
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Pay securely with Stripe. All major cards accepted.
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-slate-400" />
                </label>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p className="font-semibold mb-1">Secure Payment</p>
                  <p>
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </div>

            {/* Course List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Order Items ({checkoutData.cartItems.length})
              </h2>

              <div className="space-y-4">
                {checkoutData.cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="w-24 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden flex-shrink-0">
                      {item.thumbnailImage ? (
                        <img
                          src={item.thumbnailImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {item.instructor?.name || 'Unknown Instructor'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">
                        {formatPrice(item.currentPrice)}
                      </div>
                      {item.price !== item.currentPrice && (
                        <div className="text-sm text-slate-400 line-through">
                          {formatPrice(item.price)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {checkoutData.appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>Coupon ({checkoutData.appliedCoupon.code})</span>
                    </div>
                    <span className="font-semibold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-black text-indigo-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full group/checkout relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all py-4 px-6 shadow-lg shadow-indigo-200 hover:shadow-xl mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      {paymentMethod === 'stripe' ? 'Pay Now' : 'Place Order'}
                    </>
                  )}
                </span>
              </button>

              {/* Benefits */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Lifetime Access to Courses</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Certificate of Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;