import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import courseService from '../services/courseService';
import categoryService from '../services/categoryService';

const CourseCatalog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'PUBLISHED',
        ...filters
      };
      const data = await courseService.getAllCourses(params);
      setCourses(data.data.courses);
      setTotalPages(data.totalPages);

      // Update URL params
      const newParams = {};
      if (filters.search) newParams.search = filters.search;
      if (filters.category) newParams.category = filters.category;
      if (filters.level) newParams.level = filters.level;
      if (filters.page > 1) newParams.page = filters.page;
      setSearchParams(newParams);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      page: 1,
      limit: 12
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">All Courses</h1>
          <p className="text-gray-600">
            Explore {courses.length} courses to expand your knowledge
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="ALL_LEVELS">All Levels</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.search || filters.category || filters.level) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.search && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="ml-2 text-blue-900 hover:text-blue-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Category
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-2 text-blue-900 hover:text-blue-950"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.level && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Level: {filters.level}
                  <button
                    onClick={() => handleFilterChange('level', '')}
                    className="ml-2 text-blue-900 hover:text-blue-950"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4 text-gray-600">
              Showing {courses.length} courses
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} navigate={navigate} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 border rounded-lg ${filters.page === index + 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, navigate }) => {
  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group"
    >
      <div className="relative">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <div className="text-xs text-blue-600 font-medium mb-2">
          {course.category?.name}
        </div>
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
          {course.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {course.instructor?.firstName} {course.instructor?.lastName}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-semibold text-gray-700">
              {course.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-sm text-gray-500">
              ({course.totalReviews || 0})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>👥</span>
            <span>{course.totalEnrollments || 0}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {course.discountPrice && course.discountPrice < course.price ? (
              <>
                <span className="text-lg font-bold text-blue-600">
                  {course.discountPrice}€
                </span>
                <span className="text-sm text-gray-500 dark:text-slate-400 line-through ml-2">
                  {course.price}€
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600">
                {course.price}€
              </span>
            )}
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;