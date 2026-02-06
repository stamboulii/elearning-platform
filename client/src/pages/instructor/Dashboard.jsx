// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import courseService from '../../services/courseService';
// import {
//   BookOpen,
//   Users,
//   FileText,
//   CheckCircle,
//   Plus,
//   Eye,
//   TrendingUp,
//   DollarSign,
//   Layers,
//   Clock,
//   ChevronRight,
//   Sparkles,
//   BarChart3,
//   Award,
//   Zap,
//   Edit3
// } from 'lucide-react';

// const InstructorDashboard = () => {
//   const { user } = useAuth();
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalCourses: 0,
//     publishedCourses: 0,
//     draftCourses: 0,
//     totalStudents: 0
//   });

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   const fetchCourses = async () => {
//     try {
//       setLoading(true);
//       const data = await courseService.getInstructorCourses();
//       setCourses(data);

//       // Calculate stats
//       const stats = {
//         totalCourses: data.length,
//         publishedCourses: data.filter(c => c.status === 'PUBLISHED').length,
//         draftCourses: data.filter(c => c.status === 'DRAFT').length,
//         totalStudents: data.reduce((sum, c) => sum + c._count.enrollments, 0)
//       };
//       setStats(stats);
//     } catch (error) {
//       console.error('Error fetching courses:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
//           <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Hero Header */}
//         <div className="mb-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
//           {/* Decorative Elements */}
//           <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

//           <div className="relative z-10">
//             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
//               {/* Greeting Section */}
//               <div className="flex items-center gap-6">
//                 <div className="relative group">
//                   <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md group-hover:blur-lg transition-all"></div>
//                   <img
//                     src={user?.profilePicture || 'https://via.placeholder.com/96'}
//                     alt="Profile"
//                     className="relative w-24 h-24 rounded-full border-4 border-white shadow-2xl"
//                   />
//                   <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white p-2 rounded-full shadow-lg border-4 border-purple-600">
//                     <Award className="w-5 h-5" />
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <h1 className="text-3xl font-extrabold tracking-tight">
//                       Welcome back, {user?.firstName}!
//                     </h1>
//                     <Sparkles className="w-6 h-6 text-yellow-300" />
//                   </div>
//                   <p className="text-indigo-100 font-semibold flex items-center gap-2">
//                     <Zap className="w-4 h-4" />
//                     Instructor Dashboard - Manage your courses and students
//                   </p>
//                 </div>
//               </div>

//               {/* Quick Stats Badge */}
//               <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
//                 <div className="text-center">
//                   <div className="text-3xl font-black text-white mb-1">{stats.totalStudents}</div>
//                   <div className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Total Students</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           <StatCard
//             title="Total Courses"
//             value={stats.totalCourses}
//             icon={<BookOpen className="w-6 h-6 text-blue-600" />}
//             bgColor="bg-blue-50"
//             borderColor="border-blue-100"
//             trend="All courses"
//           />
//           <StatCard
//             title="Published"
//             value={stats.publishedCourses}
//             icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
//             bgColor="bg-emerald-50"
//             borderColor="border-emerald-100"
//             trend="Live courses"
//           />
//           <StatCard
//             title="Drafts"
//             value={stats.draftCourses}
//             icon={<FileText className="w-6 h-6 text-amber-600" />}
//             bgColor="bg-amber-50"
//             borderColor="border-amber-100"
//             trend="In progress"
//           />
//           <StatCard
//             title="Total Students"
//             value={stats.totalStudents}
//             icon={<Users className="w-6 h-6 text-purple-600" />}
//             bgColor="bg-purple-50"
//             borderColor="border-purple-100"
//             trend="Enrolled"
//           />
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-10">
//           <Link
//             to="/instructor/courses/create"
//             className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 group"
//           >
//             <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
//             Create New Course
//             <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
//           </Link>
//           <Link
//             to="/instructor/courses"
//             className="flex-1 sm:flex-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-bold shadow-sm flex items-center justify-center gap-3 group"
//           >
//             <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
//             View All Courses
//           </Link>
//         </div>

//         {/* Recent Courses */}
//         <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Courses</h2>
//               <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and edit your course content</p>
//             </div>
//             {courses.length > 5 && (
//               <Link
//                 to="/instructor/courses"
//                 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
//               >
//                 View all
//                 <ChevronRight className="w-4 h-4" />
//               </Link>
//             )}
//           </div>

//           {courses.length === 0 ? (
//             <div className="text-center py-16">
//               <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
//                 <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
//               </div>
//               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses yet</h3>
//               <p className="text-slate-500 dark:text-slate-400 mb-6">Start creating your first course to share your knowledge</p>
//               <Link
//                 to="/instructor/courses/create"
//                 className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
//               >
//                 <Plus className="w-5 h-5" />
//                 Create Your First Course
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {courses.slice(0, 5).map((course) => (
//                 <CourseRow key={course.id} course={course} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, icon, bgColor, borderColor, trend }) => (
//   <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border ${borderColor} dark:border-slate-800 shadow-sm hover:shadow-md transition-all group`}>
//     <div className="flex items-center justify-between mb-6">
//       <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
//         {icon}
//       </div>
//       <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
//     </div>
//     <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
//     <div className="flex items-end gap-3">
//       <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
//       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5">{trend}</p>
//     </div>
//   </div>
// );

// const CourseRow = ({ course }) => {
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: course.currency || 'USD'
//     }).format(price);
//   };

//   return (
//     <Link
//       to={`/instructor/courses/${course.id}/builder`}
//       className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 border border-slate-100 dark:border-slate-800 rounded-3xl hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group bg-white dark:bg-slate-900"
//     >
//       {/* Course Thumbnail */}
//       <div className="relative flex-shrink-0 w-full sm:w-24 h-24 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
//         <img
//           src={course.thumbnailImage || 'https://via.placeholder.com/96'}
//           alt={course.title}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform"
//         />
//         {course.status === 'PUBLISHED' && (
//           <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
//             <CheckCircle className="w-3 h-3" />
//           </div>
//         )}
//       </div>

//       {/* Course Info */}
//       <div className="flex-1 w-full">
//         <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
//           {course.title}
//         </h3>

//         <div className="flex items-center gap-3 flex-wrap">
//           {/* Status Badge */}
//           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${course.status === 'PUBLISHED'
//               ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
//               : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
//             }`}>
//             {course.status === 'PUBLISHED' ? (
//               <>
//                 <CheckCircle className="w-3 h-3" />
//                 Published
//               </>
//             ) : (
//               <>
//                 <FileText className="w-3 h-3" />
//                 Draft
//               </>
//             )}
//           </span>

//           {/* Students Count */}
//           <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
//             <Users className="w-3 h-3" />
//             {course._count.enrollments} students
//           </span>

//           {/* Sections Count */}
//           <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
//             <Layers className="w-3 h-3" />
//             {course._count.sections} sections
//           </span>
//         </div>
//       </div>

//       {/* Price & Action */}
//       <div className="flex sm:flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
//         <div className="text-left sm:text-right flex-1 sm:flex-none">
//           <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(course.price)}</p>
//           <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</p>
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
//             <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
//           </div>
//           <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
//         </div>
//       </div>
//     </Link>
//   );
// };

// export default InstructorDashboard;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import courseService from '../../services/courseService';
import analyticsService from '../../services/analyticsService';
import {
  BookOpen,
  Users,
  FileText,
  CheckCircle,
  Plus,
  Eye,
  TrendingUp,
  DollarSign,
  Layers,
  Clock,
  ChevronRight,
  Sparkles,
  BarChart3,
  Award,
  Zap,
  Edit3,
  AlertCircle,
  TrendingDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const InstructorDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalStudents: 0
  });

  // Analytics state
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState([]);
  const [pendingPayments, setPendingPayments] = useState(null);
  const [topCourses, setTopCourses] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch existing course data
      const coursesData = await courseService.getInstructorCourses();
      setCourses(coursesData);

      // Calculate basic stats
      const basicStats = {
        totalCourses: coursesData.length,
        publishedCourses: coursesData.filter(c => c.status === 'PUBLISHED').length,
        draftCourses: coursesData.filter(c => c.status === 'DRAFT').length,
        totalStudents: coursesData.reduce((sum, c) => sum + c._count.enrollments, 0)
      };
      setStats(basicStats);

      // Fetch analytics data
      const [revenue, enrollments, pending, top] = await Promise.all([
        analyticsService.getRevenueAnalytics(),
        analyticsService.getEnrollmentStatistics(),
        analyticsService.getPendingPayments(),
        analyticsService.getTopPerformingCourses(5)
      ]);

      setRevenueAnalytics(revenue);
      setEnrollmentStats(enrollments);
      setPendingPayments(pending);
      setTopCourses(top);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Greeting Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                  <img
                    src={user?.profilePicture || 'https://via.placeholder.com/96'}
                    alt="Profile"
                    className="relative w-24 h-24 rounded-full border-4 border-white shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white p-2 rounded-full shadow-lg border-4 border-purple-600">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      {t('instructor.dashboard.welcome', { name: user?.firstName })}
                    </h1>
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <p className="text-indigo-100 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t('instructor.dashboard.overview')}
                  </p>
                </div>
              </div>

              {/* Quick Stats Badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{stats.totalStudents}</div>
                  <div className="text-xs font-bold text-indigo-100 uppercase tracking-wider">{t('instructor.dashboard.stats.total_students')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title={t('instructor.dashboard.stats.total_courses')}
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            bgColor="bg-blue-50 dark:bg-blue-900/30"
            borderColor="border-blue-100 dark:border-blue-800"
            trend={t('common.view_all')}
          />
          <StatCard
            title={t('instructor.dashboard.stats.published')}
            value={stats.publishedCourses}
            icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            bgColor="bg-emerald-50 dark:bg-emerald-900/30"
            borderColor="border-emerald-100 dark:border-emerald-800"
            trend={t('course.status.published')}
          />
          <StatCard
            title={t('instructor.dashboard.stats.drafts')}
            value={stats.draftCourses}
            icon={<FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            bgColor="bg-amber-50 dark:bg-amber-900/30"
            borderColor="border-amber-100 dark:border-amber-800"
            trend={t('course.status.draft')}
          />
          <StatCard
            title={t('instructor.dashboard.stats.total_students')}
            value={stats.totalStudents}
            icon={<Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
            bgColor="bg-purple-50 dark:bg-purple-900/30"
            borderColor="border-purple-100 dark:border-purple-800"
            trend={t('student.dashboard.earned')}
          />
        </div>

        {/* Revenue Analytics Cards */}
        {revenueAnalytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <RevenueCard
              title={t('instructor.dashboard.analytics.total_revenue')}
              value={formatCurrency(revenueAnalytics.totalRevenue)}
              icon={<DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              bgColor="bg-emerald-50 dark:bg-emerald-900/30"
              trend={`${revenueAnalytics.paidEnrollments} ${t('course.status.completed')}`}
              trendUp={true}
            />
            <RevenueCard
              title={t('instructor.dashboard.analytics.pending_revenue')}
              value={formatCurrency(revenueAnalytics.pendingRevenue)}
              icon={<Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              bgColor="bg-amber-50 dark:bg-amber-900/30"
              trend={`${revenueAnalytics.pendingEnrollments} ${t('course.status.draft')}`}
              trendUp={false}
            />
            <RevenueCard
              title={t('instructor.dashboard.analytics.paid_enrollments')}
              value={revenueAnalytics.paidEnrollments}
              icon={<CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              bgColor="bg-blue-50 dark:bg-blue-900/30"
              trend={t('course.status.completed')}
              trendUp={true}
            />
            <RevenueCard
              title={t('instructor.dashboard.stats.total_students')}
              value={revenueAnalytics.totalEnrollments}
              icon={<Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              bgColor="bg-purple-50 dark:bg-purple-900/30"
              trend={t('admin.dashboard.period.last_year')}
              trendUp={true}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Monthly Revenue Chart */}
          {revenueAnalytics?.monthlyRevenue && revenueAnalytics.monthlyRevenue.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('instructor.dashboard.analytics.monthly_revenue')}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('admin.dashboard.period.last_90_days')}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueAnalytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(15 23 42)',
                      border: '1px solid rgb(30 41 59)',
                      borderRadius: '1rem',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Performing Courses */}
          {topCourses && topCourses.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('instructor.dashboard.analytics.top_courses')}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('admin.dashboard.tools.courses')}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCourses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-30" />
                  <XAxis
                    dataKey="title"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(15 23 42)',
                      border: '1px solid rgb(30 41 59)',
                      borderRadius: '1rem',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Enrollment Statistics Chart */}
        {enrollmentStats && enrollmentStats.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('instructor.dashboard.analytics.enrollment_stats')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('admin.dashboard.tools.users')}</p>
              </div>
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={enrollmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-30" />
                <XAxis
                  dataKey="courseTitle"
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(15 23 42)',
                    border: '1px solid rgb(30 41 59)',
                    borderRadius: '1rem',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="paidEnrollments" fill="#10b981" name="Paid" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pendingEnrollments" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pending Payments Alert */}
        {pendingPayments && pendingPayments.totalPending > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-3xl p-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                  Pending Payments
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  You have {pendingPayments.totalPending} pending payment{pendingPayments.totalPending !== 1 ? 's' : ''} totaling{' '}
                  <span className="font-bold">{formatCurrency(pendingPayments.totalPendingRevenue)}</span>
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pendingPayments.pendingPayments.slice(0, 5).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{payment.studentName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{payment.courseTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(payment.expectedAmount)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{payment.daysPending} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link
            to="/instructor/courses/create"
            className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            {t('instructor.dashboard.create_course')}
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            to="/instructor/courses"
            className="flex-1 sm:flex-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-bold shadow-sm flex items-center justify-center gap-3 group"
          >
            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {t('instructor.dashboard.view_all_courses')}
          </Link>
        </div>

        {/* Recent Courses */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('instructor.dashboard.recent_courses')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('instructor.dashboard.manage_edit')}</p>
            </div>
            {courses.length > 5 && (
              <Link
                to="/instructor/courses"
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                {t('common.view_all')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('instructor.dashboard.no_courses')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{t('instructor.dashboard.start_creating')}</p>
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
              >
                <Plus className="w-5 h-5" />
                {t('instructor.dashboard.create_course')}
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

const StatCard = ({ title, value, icon, bgColor, borderColor, trend }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border ${borderColor} dark:border-slate-800 shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-end gap-3">
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5">{trend}</p>
    </div>
  </div>
);

const RevenueCard = ({ title, value, icon, bgColor, trend, trendUp }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      {trendUp ? (
        <TrendingUp className="w-5 h-5 text-emerald-500" />
      ) : (
        <TrendingDown className="w-5 h-5 text-amber-500" />
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-end gap-3">
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5">{trend}</p>
    </div>
  </div>
);

const CourseRow = ({ course }) => {
  const { t } = useTranslation();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: course.currency || 'USD'
    }).format(price);
  };

  return (
    <Link
      to={`/instructor/courses/${course.id}/builder`}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 border border-slate-100 dark:border-slate-800 rounded-3xl hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group bg-white dark:bg-slate-900"
    >
      {/* Course Thumbnail */}
      <div className="relative flex-shrink-0 w-full sm:w-24 h-24 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/96'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {course.status === 'PUBLISHED' && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg">
            <CheckCircle className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="flex-1 w-full">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${course.status === 'PUBLISHED'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}>
            {course.status === 'PUBLISHED' ? (
              <>
                <CheckCircle className="w-3 h-3" />
                {t('course.status.published')}
              </>
            ) : (
              <>
                <FileText className="w-3 h-3" />
                {t('course.status.draft')}
              </>
            )}
          </span>

          {/* Students Count */}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Users className="w-3 h-3" />
            {course._count.enrollments} {t('course.info.students')}
          </span>

          {/* Sections Count */}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Layers className="w-3 h-3" />
            {course._count.sections} {t('course.info.sections')}
          </span>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex sm:flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
        <div className="text-left sm:text-right flex-1 sm:flex-none">
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatPrice(course.price)}</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.price')}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
            <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

export default InstructorDashboard;