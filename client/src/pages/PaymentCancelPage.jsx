import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, Home } from 'lucide-react';

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-12">
          {/* Cancel Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-8">
            <XCircle className="w-14 h-14 text-amber-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Your payment was cancelled. No charges were made to your account.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="group/cart inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5 group-hover/cart:scale-110 transition-transform" />
              Return to Cart
            </button>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-indigo-600 hover:underline">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;