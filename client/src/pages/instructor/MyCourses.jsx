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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">My Courses</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and track your courses</p>
          </div>
          <Link
            to="/instructor/courses/create"
            className="bg-indigo-600 dark:bg-indigo-500 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 active:scale-95"
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
            color="bg-indigo-500 dark:bg-indigo-600"
          />
          <StatCard
            title="Published"
            value={courses.filter(c => c.status === 'PUBLISHED').length}
            icon="✅"
            color="bg-emerald-500 dark:bg-emerald-600"
          />
          <StatCard
            title="Drafts"
            value={courses.filter(c => c.status === 'DRAFT').length}
            icon="📝"
            color="bg-amber-500 dark:bg-amber-600"
          />
          <StatCard
            title="Total Students"
            value={courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
            icon="👥"
            color="bg-purple-500 dark:bg-purple-600"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8 transition-colors duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all shadow-inner"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all shadow-inner appearance-none cursor-pointer"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all shadow-inner appearance-none cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center max-w-2xl mx-auto transition-all duration-300">
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              {searchQuery || filter !== 'ALL' ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              {searchQuery || filter !== 'ALL'
                ? 'Try adjusting your filters or search query'
                : 'Create your first course to get started'}
            </p>
            {!searchQuery && filter === 'ALL' && (
              <Link
                to="/instructor/courses/create"
                className="inline-block bg-indigo-600 dark:bg-indigo-500 text-white px-10 py-4 rounded-2xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-black shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
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
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center justify-between mb-3">
      <span className="text-4xl">{icon}</span>
      <span className={`${color} text-white text-base px-4 py-1 rounded-full font-black shadow-sm`}>
        {value}
      </span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">{title}</h3>
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
        return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'DRAFT':
        return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'ARCHIVED':
        return 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500 overflow-hidden group">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-72 h-48 md:h-auto relative overflow-hidden">
          <img
            src={course.thumbnailImage || 'https://via.placeholder.com/400x300'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${getStatusColor(course.status)}`}>
            {course.status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3
                className="text-2xl font-black text-slate-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors tracking-tight"
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                {course.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 font-medium leading-relaxed">{course.shortDescription}</p>
            </div>

            {/* Menu Button */}
            <div className="relative ml-6">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl py-3 z-20 border border-slate-100 dark:border-slate-700 backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95 origin-top-right">
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-5 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-bold text-sm"
                    >
                      <span>👁️</span> View Details
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}/builder`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-5 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-bold text-sm"
                    >
                      <span>🛠️</span> Edit Content
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}/edit`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-5 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-bold text-sm"
                    >
                      <span>✏️</span> Edit Info
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-5" />
                    <button
                      onClick={() => {
                        onDelete(course.id, course.title);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-5 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors font-bold text-sm"
                    >
                      <span>🗑️</span> Delete Course
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
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 underline decoration-emerald-500/30">Completed</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {stats.completedEnrollments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 underline decoration-indigo-500/30">In Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {stats.inProgressEnrollments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 dark:text-slate-500 underline decoration-purple-500/30">Avg Progress</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    {stats.averageProgress}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}/builder`)}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 active:scale-[0.98]"
            >
              Manage Content
            </button>
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}`)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold active:scale-[0.98]"
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
  <div className="text-center p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800">
    <div className="text-2xl mb-1.5">{icon}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</div>
    <div className="font-black text-slate-900 dark:text-white text-sm">{value}</div>
  </div>
);

export default MyCourses;