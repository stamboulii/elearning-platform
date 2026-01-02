import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import enrollmentService from '../../services/enrollmentService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    averageProgress: 0
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentService.getMyEnrollments();
      const enrollmentsList = data.data?.enrollments || data || [];
      setEnrollments(enrollmentsList);

      // Calculate stats
      const stats = {
        totalCourses: enrollmentsList.length,
        completedCourses: enrollmentsList.filter(e => e.completionStatus === 'COMPLETED').length,
        inProgressCourses: enrollmentsList.filter(e => e.completionStatus === 'IN_PROGRESS').length,
        averageProgress: enrollmentsList.length > 0
          ? Math.round(enrollmentsList.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollmentsList.length)
          : 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon="📚"
            color="bg-blue-500"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressCourses}
            icon="🔄"
            color="bg-yellow-500"
          />
          <StatCard
            title="Completed"
            value={stats.completedCourses}
            icon="✅"
            color="bg-green-500"
          />
          <StatCard
            title="Avg Progress"
            value={`${stats.averageProgress}%`}
            icon="📊"
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link
            to="/courses"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Browse Courses
          </Link>
          <Link
            to="/student/courses"
            className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
          >
            My Courses
          </Link>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>
          
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
              <Link
                to="/courses"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse available courses →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 5).map((enrollment) => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
              ))}
              {enrollments.length > 5 && (
                <Link
                  to="/student/courses"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium py-4"
                >
                  View all courses →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className={`${color} text-white text-sm px-3 py-1 rounded-full`}>
        {value}
      </span>
    </div>
    <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
  </div>
);

const EnrollmentCard = ({ enrollment }) => {
  const course = enrollment.course;
  const progress = enrollment.progressPercentage || 0;

  return (
    <Link
      to={`/student/courses/${course.id}/learn`}
      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
    >
      <div className="flex items-center gap-4 flex-1">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/80'}
          alt={course.title}
          className="w-20 h-20 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span className={`px-2 py-1 rounded ${
              enrollment.completionStatus === 'COMPLETED' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {enrollment.completionStatus === 'COMPLETED' ? 'Completed' : 'In Progress'}
            </span>
            {enrollment.lastAccessed && (
              <span>Last accessed: {new Date(enrollment.lastAccessed).toLocaleDateString()}</span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
        </div>
      </div>
      <div className="ml-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
          Continue
        </button>
      </div>
    </Link>
  );
};

export default StudentDashboard;

