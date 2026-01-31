import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Users, Star, BookOpen, Eye, X, ChevronRight, Play, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from '../utils/toast';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const fetchWishlist = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/wishlist?page=${pageNum}&limit=12`);
      const data = response.data.data;
      
      if (pageNum === 1) {
        setWishlist(data.items);
      } else {
        setWishlist(prev => [...prev, ...data.items]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist(1);
  }, []);

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      await api.delete(`/wishlist/${courseId}`);
      setWishlist(prev => prev.filter(item => item.courseId !== courseId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  if (isLoading && wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded-2xl w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
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
          <div className="flex items-center gap-4 mb-3">
            <div className="p-4 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Favorites</h1>
              <p className="text-slate-500 mt-1 font-medium">
                {wishlist.length} course{wishlist.length !== 1 ? 's' : ''} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Courses */}
        {wishlist.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                    {item.course.thumbnailImage ? (
                      <>
                        <img
                          src={item.course.thumbnailImage}
                          alt={item.course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-slate-300" />
                      </div>
                    )}
                    
                    {/* Favorite Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-current" />
                        Saved
                      </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-black text-slate-900 shadow-lg">
                        {item.course.isFree ? 'Free' : formatPrice(item.course.price)}
                      </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveFromWishlist(item.courseId)}
                        className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-lg"
                        title="Remove from favorites"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <Link to={`/courses/${item.course.id}`}>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {item.course.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">
                      {item.course.shortDescription}
                    </p>

                    {/* Instructor */}
                    {item.course.instructor && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 overflow-hidden flex-shrink-0">
                          {item.course.instructor.profilePicture ? (
                            <img 
                              src={item.course.instructor.profilePicture} 
                              alt={item.course.instructor.firstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">
                              {item.course.instructor.firstName?.charAt(0) || 'I'}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-slate-600 truncate">
                          {item.course.instructor.firstName} {item.course.instructor.lastName}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                      <div className="flex items-center gap-3">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="font-semibold">{item.course.avgRating || 0}</span>
                        </div>

                        {/* Enrollments */}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{item.course.enrollmentsCount || 0}</span>
                        </div>

                        {/* Duration */}
                        {item.course.estimatedDuration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{item.course.estimatedDuration}h</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Level */}
                      {item.course.level && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg capitalize">
                          {item.course.level}
                        </span>
                      )}
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                      <Link
                        to={`/courses/${item.course.id}`}
                        className="flex-1 group/view relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all py-3 px-4 text-center shadow-lg shadow-indigo-200 hover:shadow-xl"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 translate-y-full group-hover/view:translate-y-0 transition-transform duration-300"></span>
                      </Link>
                      
                      <button
                        onClick={() => handleRemoveFromWishlist(item.courseId)}
                        className="group/remove p-3 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all border border-slate-200 hover:border-rose-200"
                        title="Remove from favorites"
                      >
                        <X className="w-5 h-5 group-hover/remove:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Quick Preview Button */}
                    <div className="mt-4">
                      <button className="w-full py-2.5 text-sm text-slate-500 hover:text-indigo-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 group/preview">
                        <Play className="w-4 h-4 group-hover/preview:text-indigo-600" />
                        Preview Course
                        <ChevronRight className="w-4 h-4 group-hover/preview:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => fetchWishlist(page + 1)}
                  disabled={isLoading}
                  className="group/loadmore px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600"></div>
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 group-hover/loadmore:text-indigo-600" />
                      Load More Courses
                      <ChevronRight className="w-4 h-4 group-hover/loadmore:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          // Enhanced Empty State
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-50 to-pink-50 rounded-full mb-8">
              <Heart className="w-12 h-12 text-rose-400" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Your favorites list is empty</h3>
            <p className="text-slate-500 mb-8 text-lg max-w-md mx-auto">
              Courses you add to favorites will appear here. Start exploring and save courses you're interested in learning!
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
                to="/courses?filter=popular"
                className="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                View Popular
              </Link>
            </div>
            
            {/* Quick Categories */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-4">Quick categories to explore:</p>
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
    </div>
  );
};

export default WishlistPage;