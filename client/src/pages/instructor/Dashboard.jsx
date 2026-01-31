import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getInstructorCourses();
      setCourses(data);

      // Calculate stats
      const stats = {
        totalCourses: data.length,
        publishedCourses: data.filter(c => c.status === 'PUBLISHED').length,
        draftCourses: data.filter(c => c.status === 'DRAFT').length,
        totalStudents: data.reduce((sum, c) => sum + c._count.enrollments, 0)
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600">Manage your courses and track your progress</p>
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
            title="Published"
            value={stats.publishedCourses}
            icon="✅"
            color="bg-green-500"
          />
          <StatCard
            title="Drafts"
            value={stats.draftCourses}
            icon="📝"
            color="bg-yellow-500"
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon="👥"
            color="bg-purple-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <Link
            to="/instructor/courses/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Create New Course
          </Link>
          <Link
            to="/instructor/courses"
            className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
          >
            View All Courses
          </Link>
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Courses</h2>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
              <Link
                to="/instructor/courses/create"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first course →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
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

const CourseRow = ({ course }) => (
  <Link
    to={`/instructor/courses/${course.id}/builder`}
    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
  >
    <div className="flex items-center gap-4">
      <img
        src={course.thumbnailImage || 'https://via.placeholder.com/80'}
        alt={course.title}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div>
        <h3 className="font-semibold text-gray-800">{course.title}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span className={`px-2 py-1 rounded ${course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
            {course.status}
          </span>
          <span>👥 {course._count.enrollments} students</span>
          <span>📝 {course._count.sections} sections</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="text-2xl font-bold text-blue-600">${course.price}</p>
      <p className="text-sm text-gray-500">Price</p>
    </div>
  </Link>
);

export default InstructorDashboard;