/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
    
  useEffect(() => {
    fetchCourses();
  }, []); // Empty dependency array is fine here

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getInstructorCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      alert('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    if (filter !== 'ALL' && course.status !== filter) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        course.shortDescription.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'students':
        return b._count.enrollments - a._count.enrollments;
      default:
        return 0;
    }
  });

  if (loading) {
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
            <p className="text-gray-600">Manage and track your courses</p>
          </div>
          <Link
            to="/instructor/courses/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Create New Course
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon="📚"
            color="bg-blue-500"
          />
          <StatCard
            title="Published"
            value={courses.filter(c => c.status === 'PUBLISHED').length}
            icon="✅"
            color="bg-green-500"
          />
          <StatCard
            title="Drafts"
            value={courses.filter(c => c.status === 'DRAFT').length}
            icon="📝"
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Students"
            value={courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
            icon="👥"
            color="bg-purple-500"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="students">Most Students</option>
              </select>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {sortedCourses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery || filter !== 'ALL' ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filter !== 'ALL'
                ? 'Try adjusting your filters or search query'
                : 'Create your first course to get started'}
            </p>
            {!searchQuery && filter === 'ALL' && (
              <Link
                to="/instructor/courses/create"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-3xl">{icon}</span>
      <span className={`${color} text-white text-lg px-4 py-1 rounded-full font-bold`}>
        {value}
      </span>
    </div>
    <h3 className="text-gray-600 font-medium">{title}</h3>
  </div>
);

// Course Card Component
const CourseCard = ({ course, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState(null);

  // Navigate is used in onClick handlers below

  useEffect(() => {
    const fetchStats = async () => {
      if (course.status !== 'PUBLISHED') return;
      
      try {
        const response = await enrollmentService.getCourseStats(course.id);
        setStats(response);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [course.id, course.status]); // Add dependencies

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-700';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-64 h-48 md:h-auto relative">
          <img
            src={course.thumbnailImage || 'https://via.placeholder.com/400x300'}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
            {course.status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 
                className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer"
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">{course.shortDescription}</p>
            </div>

            {/* Menu Button */}
            <div className="relative ml-4">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}`);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}/builder`);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Edit Content
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}/edit`);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Edit Info
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        onDelete(course.id, course.title);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <StatItem icon="💰" label="Price" value={`$${course.price}`} />
            <StatItem icon="👥" label="Students" value={course._count.enrollments} />
            <StatItem icon="📚" label="Sections" value={course._count.sections} />
            <StatItem icon="⭐" label="Reviews" value={course._count.reviews} />
            <StatItem icon="📊" label="Level" value={course.level} />
          </div>

          {/* Additional Stats for Published Courses */}
          {course.status === 'PUBLISHED' && stats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold text-green-600">
                    {stats.completedEnrollments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">In Progress:</span>
                  <span className="font-semibold text-blue-600">
                    {stats.inProgressEnrollments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Avg Progress:</span>
                  <span className="font-semibold text-purple-600">
                    {stats.averageProgress}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}/builder`)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Manage Content
            </button>
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}`)}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ icon, label, value }) => (
  <div className="text-center">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xs text-gray-600 mb-1">{label}</div>
    <div className="font-semibold text-gray-800">{value}</div>
  </div>
);

export default MyCourses;