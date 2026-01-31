import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/checkout?course=${courseId}` } });
      return;
    }

    if (!courseId) {
      navigate('/courses');
      return;
    }

    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourse(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user, navigate]);

  const handleCompletePurchase = async () => {
    try {
      setProcessing(true);
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, we just enroll the user directly since real payment is not yet implemented
      await enrollmentService.enrollInCourse(courseId);
      
      navigate(`/student/courses/${courseId}/learn`, { 
        state: { message: 'Purchase successful! Welcome to the course.' } 
      });
    } catch (error) {
      console.error('Purchase error:', error);
      alert(error.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const price = course.discountPrice || course.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-semibold text-lg text-gray-800">Course Details</h2>
              </div>
              <div className="p-6 flex gap-4">
                <img 
                  src={course.thumbnailImage || 'https://via.placeholder.com/150'} 
                  alt={course.title}
                  className="w-32 h-20 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium text-gray-700">{course.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method (Placeholder) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-semibold text-lg text-gray-800">Payment Method</h2>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Test Mode</span>
              </div>
              <div className="p-8">
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">💳</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Simulated Payment</h3>
                  <p className="text-gray-600 max-w-md">
                    Real payment integration (Stripe/PayPal) will be added in the next step. 
                    Click the button below to complete your enrollment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-8">
              <h2 className="font-bold text-xl text-gray-900 mb-6">Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Original Price</span>
                  <span>${course.price}</span>
                </div>
                {course.discountPrice && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-${(course.price - course.discountPrice).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-extrabold text-blue-600 text-3xl">${price}</span>
                </div>
              </div>

              <button
                onClick={handleCompletePurchase}
                disabled={processing}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-95 ${
                  processing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-blue-200'
                }`}
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  'Complete Purchase'
                )}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Lifetime access to course material</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
