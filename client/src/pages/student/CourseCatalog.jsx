import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import courseService from '../../services/courseService';
import categoryService from '../../services/categoryService';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from '../../utils/toast';
import {
  Search, Filter, Clock, TrendingUp, Star, Users, BookOpen,
  Heart, ChevronRight, Sparkles, Award, Zap
} from 'lucide-react';

const CourseCatalog = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [favorites, setFavorites] = useState({});
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        courseService.getAllCourses(),
        categoryService.getAllCategories()
      ]);
      setCourses(coursesData.data?.courses || coursesData || []);
      setCategories(categoriesData || []);
      if (isAuthenticated) await fetchUserFavorites();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('course_catalog.error_load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchUserFavorites = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/wishlist');
      const wishlistItems = response.data?.data?.items || [];
      const favoritesMap = {};
      wishlistItems.forEach(item => { favoritesMap[item.courseId] = true; });
      setFavorites(favoritesMap);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (sortBy) filters.sortBy = sortBy;
      if (searchQuery) filters.search = searchQuery;
      const data = await courseService.getAllCourses(filters);
      setCourses(data.data?.courses || data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error(t('course_catalog.error_search'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [searchQuery, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleToggleFavorite = async (courseId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info(t('course_catalog.login_for_favorites'));
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    const isCurrentlyFavorite = favorites[courseId];
    const loadingToast = toast.loading(
      isCurrentlyFavorite
        ? t('course_catalog.removing_favorite')
        : t('course_catalog.adding_favorite')
    );

    try {
      if (isCurrentlyFavorite) {
        await api.delete(`/wishlist/${courseId}`);
        setFavorites(prev => { const n = { ...prev }; delete n[courseId]; return n; });
        toast.dismiss(loadingToast);
        toast.success(t('course_catalog.removed_favorite'));
        window.dispatchEvent(new Event('favorites-updated'));
      } else {
        await api.post('/wishlist', { courseId });
        setFavorites(prev => ({ ...prev, [courseId]: true }));
        toast.dismiss(loadingToast);
        toast.success(t('course_catalog.added_favorite'));
        window.dispatchEvent(new Event('favorites-updated'));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      if (error.response?.status === 409) {
        toast.error(t('course_catalog.already_favorite'));
        setFavorites(prev => ({ ...prev, [courseId]: true }));
      } else if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error(t('course_catalog.session_expired'));
        navigate('/login');
      } else {
        toast.error(t('course_catalog.error_favorite'));
      }
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('course_catalog.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t('course_catalog.title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {t('course_catalog.subtitle')}
                </p>
              </div>
            </div>

            {isAuthenticated && user?.role === 'STUDENT' && (
              <Link
                to="/wishlist"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 transition-all font-medium shadow-sm group"
              >
                <Heart className="w-4 h-4 text-rose-500 group-hover:text-rose-600" />
                <span>{t('course_catalog.my_favorites')}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 mb-10">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('course_catalog.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t('course_catalog.search_button')}
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">{t('course_catalog.all_categories')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="newest">{t('course_catalog.sort_newest')}</option>
                  <option value="oldest">{t('course_catalog.sort_oldest')}</option>
                  <option value="price-low">{t('course_catalog.sort_price_low')}</option>
                  <option value="price-high">{t('course_catalog.sort_price_high')}</option>
                  <option value="popular">{t('course_catalog.sort_popular')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchQuery) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('course_catalog.active_filters')}
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                  {t('course_catalog.filter_search')} "{searchQuery}"
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                  {t('course_catalog.filter_category')} {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
              >
                {t('course_catalog.clear_all')}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                {t('course_catalog.loading')}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                {courses.length} {courses.length === 1 ? t('course_catalog.course_found') : t('course_catalog.courses_found')}
                {!isAuthenticated && (
                  <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {t('course_catalog.sign_in_favorites')}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('course_catalog.no_courses_title')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {t('course_catalog.no_courses_subtitle')}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSortBy('newest'); }}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200"
            >
              {t('course_catalog.clear_filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isFavorite={favorites[course.id] || false}
                onToggleFavorite={handleToggleFavorite}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, isFavorite, onToggleFavorite, isAuthenticated }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: course.currency || 'USD'
    }).format(price);
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
      advanced: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return colors[level?.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getLevelIcon = (level) => {
    const icons = {
      beginner: <Zap className="w-3 h-3" />,
      intermediate: <TrendingUp className="w-3 h-3" />,
      advanced: <Award className="w-3 h-3" />
    };
    return icons[level?.toLowerCase()] || <BookOpen className="w-3 h-3" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group">
      <div className="relative overflow-hidden h-48">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {course.status === 'PUBLISHED' && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {t('course_catalog.published')}
          </span>
        )}

        {isAuthenticated && user?.role === 'STUDENT' && (
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={(e) => onToggleFavorite(course.id, e)}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${
                isFavorite
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white'
              }`}
              title={isFavorite ? t('course_catalog.remove_favorite') : t('course_catalog.add_favorite')}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        {course.discountPrice && (
          <span className="absolute bottom-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-3 py-1.5 rounded-lg font-black shadow-lg">
            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% {t('course_catalog.off')}
          </span>
        )}
      </div>

      <Link to={`/courses/${course.id}`} className="block p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
          {course.shortDescription}
        </p>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getLevelColor(course.level)} dark:opacity-90`}>
            {getLevelIcon(course.level)}
            {t(`course_catalog.level_${course.level?.toLowerCase()}`) || course.level}
          </span>

          {course.estimatedDuration && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              {course.estimatedDuration}h
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Users className="w-3 h-3" />
            {course.totalEnrollments || 0}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="w-3 h-3 fill-current" />
            {course.averageRating ? Number(course.averageRating).toFixed(1) : '0.0'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {course.discountPrice ? (
              <>
                <span className="text-2xl font-black text-indigo-600">{formatPrice(course.discountPrice)}</span>
                <span className="text-sm text-slate-400 line-through font-semibold">{formatPrice(course.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-black text-slate-900 dark:text-white">{formatPrice(course.price)}</span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </div>
  );
};

export default CourseCatalog;