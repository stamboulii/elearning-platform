import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, BookOpen, Home, AlertCircle } from 'lucide-react';
import api from '../services/api';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      const transactionId = searchParams.get('transaction_id');

      if (!sessionId || !transactionId) {
        setError('Invalid payment verification link');
        setLoading(false);
        return;
      }

      // Call backend to verify and process payment
      const response = await api.get('/checkout/success', {
        params: { session_id: sessionId, transaction_id: transactionId }
      });

      if (response.data.success) {
        setPaymentData(response.data.data);
        
        // Clear checkout data from session storage
        sessionStorage.removeItem('checkoutData');
        
        // Dispatch event to update cart count
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        setError(response.data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Processing Your Payment
          </h2>
          <p className="text-slate-600">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Payment Verification Failed
          </h2>
          <p className="text-slate-600 mb-8">
            {error}
          </p>
          <button
            onClick={() => navigate('/cart')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-8 animate-bounce">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Thank you for your purchase. Your courses are now available.
          </p>

          {/* Payment Details */}
          {paymentData && (
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Courses Enrolled</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {paymentData.enrollments || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Transactions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {paymentData.transactions || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/courses/my-courses')}
              className="group/courses inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              <BookOpen className="w-5 h-5 group-hover/courses:scale-110 transition-transform" />
              Go to My Courses
            </button>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;