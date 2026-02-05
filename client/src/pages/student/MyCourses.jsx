import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import enrollmentService from '../../services/enrollmentService';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | IN_PROGRESS | COMPLETED
  const [searchQuery, setSearchQuery] = useState('');

  // ---- Data Fetching (safe, one-time)
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const response = await enrollmentService.getMyEnrollments();

        const normalized =
          response?.data?.enrollments ??
          response?.enrollments ??
          response ??
          [];

        setEnrollments(Array.isArray(normalized) ? normalized : []);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  // ---- Derived state (filter + search)
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const course = enrollment.course;
      if (!course) return false;

      if (filter !== 'ALL' && enrollment.completionStatus !== filter) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          course.title?.toLowerCase().includes(q) ||
          course.shortDescription?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [enrollments, filter, searchQuery]);

  // ---- Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            My Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage and continue your enrolled courses
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Courses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Courses */}
        {filteredEnrollments.length === 0 ? (
          <EmptyState hasEnrollments={enrollments.length > 0} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------

const EmptyState = ({ hasEnrollments }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
    {hasEnrollments ? (
      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
        No courses match your filters
      </p>
    ) : (
      <>
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-4 font-medium">
          You haven't enrolled in any courses yet
        </p>
        <Link
          to="/courses"
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold"
        >
          Browse available courses →
        </Link>
      </>
    )}
  </div>
);

// ----------------------------------------------------------------

const EnrollmentCard = ({ enrollment }) => {
  const course = enrollment.course;
  if (!course) return null;

  const progress = enrollment.progressPercentage ?? 0;
  const completed = enrollment.completionStatus === 'COMPLETED';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/student/courses/${course.id}/learn`}>
        <div className="relative">
          <img
            src={course.thumbnailImage || 'https://placehold.co/400x225'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <span
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${completed
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-white'
              }`}
          >
            {completed ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/student/courses/${course.id}/learn`}>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {course.title}
          </h3>
        </Link>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 font-medium">
          {course.shortDescription}
        </p>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="uppercase tracking-wider">Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 shadow-inner">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${completed ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {enrollment.lastAccessed && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium italic">
            Last accessed:{' '}
            {new Date(enrollment.lastAccessed).toLocaleDateString()}
          </p>
        )}

        <Link
          to={`/student/courses/${course.id}/learn`}
          className="block w-full bg-indigo-600 dark:bg-indigo-500 text-white text-center py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200"
        >
          {completed ? 'Review Course' : 'Continue Learning'}
        </Link>
      </div>
    </div>
  );
};

export default MyCourses;
