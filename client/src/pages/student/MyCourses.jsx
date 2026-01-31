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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            My Courses
          </h1>
          <p className="text-gray-600">
            Manage and continue your enrolled courses
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
  <div className="bg-white rounded-lg shadow-md p-12 text-center">
    {hasEnrollments ? (
      <p className="text-gray-500 text-lg">
        No courses match your filters
      </p>
    ) : (
      <>
        <p className="text-gray-500 text-lg mb-4">
          You haven't enrolled in any courses yet
        </p>
        <Link
          to="/courses"
          className="text-blue-600 hover:text-blue-700 font-medium"
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      <Link to={`/student/courses/${course.id}/learn`}>
        <div className="relative">
          <img
            src={course.thumbnailImage || 'https://placehold.co/400x225'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <span
            className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
              completed
                ? 'bg-green-600 text-white'
                : 'bg-yellow-500 text-white'
            }`}
          >
            {completed ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/student/courses/${course.id}/learn`}>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition">
            {course.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.shortDescription}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                completed ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {enrollment.lastAccessed && (
          <p className="text-xs text-gray-500 mb-4">
            Last accessed:{' '}
            {new Date(enrollment.lastAccessed).toLocaleDateString()}
          </p>
        )}

        <Link
          to={`/student/courses/${course.id}/learn`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          {completed ? 'Review Course' : 'Continue Learning'}
        </Link>
      </div>
    </div>
  );
};

export default MyCourses;
