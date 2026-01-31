import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';

const AdminCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    instructor: '',
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCoursesAdmin(filters);
      setCourses(data.data.courses);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);


  const handleApproveCourse = async (courseId) => {
    if (!confirm('Are you sure you want to approve this course?')) return;

    try {
      await adminService.approveCourse(courseId);
      alert('Course approved successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Failed to approve course');
    }
  };

  const handleRejectCourse = (course) => {
    setSelectedCourse(course);
    setShowRejectModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    try {
      await adminService.deleteUser(courseId);
      alert('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Management</h1>
          <p className="text-gray-600">Manage all platform courses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Courses" value={courses.length} color="bg-blue-500" />
          <StatCard
            title="Published"
            value={courses.filter(c => c.status === 'PUBLISHED').length}
            color="bg-green-500"
          />
          <StatCard
            title="Draft"
            value={courses.filter(c => c.status === 'DRAFT').length}
            color="bg-yellow-500"
          />
          <StatCard
            title="Archived"
            value={courses.filter(c => c.status === 'ARCHIVED').length}
            color="bg-gray-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilters({ search: '', status: '', category: '', instructor: '', page: 1, limit: 20 })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No courses found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onApprove={handleApproveCourse}
                  onReject={handleRejectCourse}
                  onDelete={handleDeleteCourse}
                  onViewDetails={() => navigate(`/courses/${course.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setFilters({ ...filters, page: index + 1 })}
                    className={`px-4 py-2 border rounded-lg ${filters.page === index + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedCourse && (
          <RejectCourseModal
            course={selectedCourse}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedCourse(null);
            }}
            onSuccess={() => {
              fetchCourses();
              setShowRejectModal(false);
              setSelectedCourse(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl`}>
        📚
      </div>
    </div>
  </div>
);

// Course Card Component
const CourseCard = ({ course, onApprove, onReject, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-700';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-700';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.shortDescription}</p>

              {/* Instructor */}
              <div className="flex items-center gap-2 mb-3">
                <img
                  src={course.instructor?.profilePicture || 'https://via.placeholder.com/32'}
                  alt={course.instructor?.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-700">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span>👥 {course._count?.enrollments || 0} students</span>
                <span>⭐ {course.averageRating?.toFixed(1) || '0.0'} ({course._count?.reviews || 0})</span>
                <span>📚 {course._count?.sections || 0} sections</span>
                <span>💰 ${course.price}</span>
              </div>

              {/* Category & Level */}
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  {course.category?.name || 'Uncategorized'}
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  {course.level}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={onViewDetails}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
            >
              View Details
            </button>

            {course.status === 'DRAFT' && (
              <button
                onClick={() => onApprove(course.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm font-medium"
              >
                Approve
              </button>
            )}

            {course.status === 'PUBLISHED' && (
              <button
                onClick={() => onReject(course)}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition text-sm font-medium"
              >
                Archive
              </button>
            )}

            <button
              onClick={() => onDelete(course.id)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reject Course Modal
const RejectCourseModal = ({ course, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      await adminService.rejectCourse(course.id, reason);
      alert('Course rejected successfully');
      onSuccess();
    } catch (error) {
      console.error('Error rejecting course:', error);
      alert('Failed to reject course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Reject Course</h2>
        <p className="text-gray-600 mb-6">
          You are about to reject: <strong>{course.title}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Please explain why this course is being rejected..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject Course'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCourses;