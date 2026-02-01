import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  FileText,
  Archive,
  Eye,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Star,
  Layers,
  DollarSign,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  XCircle,
  Sparkles
} from 'lucide-react';

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

  const hasActiveFilters = filters.search || filters.status || filters.category;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Course Management</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage all platform courses and approvals</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon={<BookOpen className="w-6 h-6 text-indigo-600" />}
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
          />
          <StatCard
            title="Published"
            value={courses.filter(c => c.status === 'PUBLISHED').length}
            icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
          />
          <StatCard
            title="Draft"
            value={courses.filter(c => c.status === 'DRAFT').length}
            icon={<FileText className="w-6 h-6 text-amber-600" />}
            bgColor="bg-amber-50"
            borderColor="border-amber-100"
          />
          <StatCard
            title="Archived"
            value={courses.filter(c => c.status === 'ARCHIVED').length}
            icon={<Archive className="w-6 h-6 text-slate-600" />}
            bgColor="bg-slate-50"
            borderColor="border-slate-100"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ search: '', status: '', category: '', instructor: '', page: 1, limit: 20 })}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                hasActiveFilters
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              }`}
              disabled={!hasActiveFilters}
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                  Status: {filters.status}
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                  Category: {categories.find(c => c.id === filters.category)?.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search query</p>
            {hasActiveFilters && (
              <button
                onClick={() => setFilters({ search: '', status: '', category: '', instructor: '', page: 1, limit: 20 })}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Filters
              </button>
            )}
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
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                <div className="flex gap-2">
                  {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = index + 1;
                    } else if (filters.page <= 4) {
                      pageNumber = index + 1;
                    } else if (filters.page >= totalPages - 3) {
                      pageNumber = totalPages - 6 + index;
                    } else {
                      pageNumber = filters.page - 3 + index;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setFilters({ ...filters, page: pageNumber })}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          filters.page === pageNumber
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === totalPages}
                  className="p-2.5 border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
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
const StatCard = ({ title, value, icon, bgColor, borderColor }) => (
  <div className={`bg-white rounded-3xl p-6 border ${borderColor} shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <TrendingUp className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
    </div>
    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900">{value}</p>
  </div>
);

// Course Card Component
const CourseCard = ({ course, onApprove, onReject, onDelete, onViewDetails }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return {
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'DRAFT':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <FileText className="w-3 h-3" />
        };
      case 'ARCHIVED':
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <Archive className="w-3 h-3" />
        };
      default:
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };

  const statusConfig = getStatusConfig(course.status);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all group">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-80 h-56 md:h-auto relative flex-shrink-0">
          <img
            src={course.thumbnailImage || 'https://via.placeholder.com/400x300'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.color} backdrop-blur-sm flex items-center gap-1`}>
            {statusConfig.icon}
            {course.status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
              {course.shortDescription}
            </p>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={course.instructor?.profilePicture || 'https://via.placeholder.com/32'}
                alt={course.instructor?.firstName}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                <p className="text-xs text-slate-500">Instructor</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600">
                <Users className="w-4 h-4" />
                {course._count?.enrollments || 0}
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                <Star className="w-4 h-4 fill-current" />
                {course.averageRating?.toFixed(1) || '0.0'} ({course._count?.reviews || 0})
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600">
                <Layers className="w-4 h-4" />
                {course._count?.sections || 0} sections
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600">
                <DollarSign className="w-4 h-4" />
                {course.price}
              </span>
            </div>

            {/* Category & Level */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">
                {course.category?.name || 'Uncategorized'}
              </span>
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold border border-purple-100">
                {course.level}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onViewDetails}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            {course.status === 'DRAFT' && (
              <button
                onClick={() => onApprove(course.id)}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            )}

            {course.status === 'PUBLISHED' && (
              <button
                onClick={() => onReject(course)}
                className="px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-bold text-sm shadow-sm flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            )}

            <button
              onClick={() => onDelete(course.id)}
              className="px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold text-sm shadow-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Reject Course</h2>
              <p className="text-sm text-slate-500 mt-1">This action will archive the course</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Course Info */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
          <p className="text-sm text-slate-600 mb-1">You are about to reject:</p>
          <p className="font-bold text-slate-900">{course.title}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Reason for rejection <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Please explain why this course is being rejected..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none placeholder:text-slate-400"
              required
            />
            <p className="text-xs text-slate-500 mt-2">The instructor will receive this feedback</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 text-white py-3 rounded-xl hover:bg-rose-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Reject Course
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold"
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