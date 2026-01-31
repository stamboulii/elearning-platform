import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import categoryService from '../../services/categoryService';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const fetchData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        courseService.getAllCourses(),
        categoryService.getAllCategories()
      ]);
      setCourses(coursesData.data?.courses || coursesData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
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
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchCourses();
}, [searchQuery, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Course Catalog</h1>
          <p className="text-gray-600">Discover and enroll in courses that interest you</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No courses found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: course.currency || 'USD'
    }).format(price);
  };

  return (
    <Link
      to={`/courses/${course.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
    >
      <div className="relative">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        {course.status === 'PUBLISHED' && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            Published
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.shortDescription}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              {course.discountPrice ? formatPrice(course.discountPrice) : formatPrice(course.price)}
            </span>
            {course.discountPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 capitalize">{course.level}</span>
        </div>
        {course.estimatedDuration && (
          <div className="mt-2 text-sm text-gray-500">
            ⏱️ {course.estimatedDuration} hours
          </div>
        )}
      </div>
    </Link>
  );
};

export default CourseCatalog;

