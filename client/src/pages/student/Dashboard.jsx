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
        {/* Header with XP & Level */}
        <div className="mb-8 bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user?.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-blue-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-4 border-blue-900 shadow-lg">
                  {user?.level || 1}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black mb-1">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-blue-200">Level {user?.level || 1} Scholar</p>
              </div>
            </div>

            <div className="flex-1 max-w-md w-full">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">XP Progress</span>
                <span className="text-sm font-black text-yellow-400">{user?.xp % 1000} / 1000 XP</span>
              </div>
              <div className="w-full bg-blue-950/50 rounded-full h-4 p-1 shadow-inner">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000"
                  style={{ width: `${(user?.xp % 1000) / 10}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-blue-300 mt-2 text-right italic">
                {1000 - (user?.xp % 1000)} XP until level {(user?.level || 1) + 1}!
              </p>
            </div>
          </div>
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
        {/* Quick Actions & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex gap-4">
              <Link
                to="/courses"
                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition font-bold text-center shadow-lg shadow-blue-200"
              >
                Browse Courses
              </Link>
              <Link
                to="/student/courses"
                className="flex-1 bg-white text-gray-700 px-6 py-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition font-bold text-center shadow-sm"
              >
                My Courses
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-gray-50 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-800">My Badges</h3>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-full">
                {user?.badges?.length || 0} Earned
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {user?.badges?.length > 0 ? (
                user.badges.map((ub) => (
                  <div key={ub.id} className="flex-shrink-0 group relative">
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl border-2 border-yellow-100 group-hover:scale-110 transition-transform cursor-pointer">
                      {ub.badge?.icon || '🏅'}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 bg-gray-900 text-white text-[10px] p-2 rounded-lg text-center z-20">
                      <div className="font-bold border-b border-gray-700 mb-1 pb-1">{ub.badge?.name}</div>
                      {ub.badge?.description}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Complete lessons to earn badges!</p>
              )}
            </div>
          </div>
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
            <span className={`px-2 py-1 rounded ${enrollment.completionStatus === 'COMPLETED'
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
      <div className="ml-4 flex flex-col gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap">
          {progress === 100 ? 'Review' : 'Continue'}
        </button>

        {enrollment.completionStatus === 'COMPLETED' && enrollment.certificate && (
          <Link
            to={`/student/certificates/${enrollment.certificate.id}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition text-sm font-bold text-center whitespace-nowrap"
          >
            📜 Certificate
          </Link>
        )}
      </div>
    </Link>
  );
};

export default StudentDashboard;

