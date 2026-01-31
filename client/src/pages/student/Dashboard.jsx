// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import enrollmentService from '../../services/enrollmentService';

// const StudentDashboard = () => {
//   const { user } = useAuth();
//   const [enrollments, setEnrollments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalCourses: 0,
//     completedCourses: 0,
//     inProgressCourses: 0,
//     averageProgress: 0
//   });

//   useEffect(() => {
//     fetchEnrollments();
//   }, []);

//   const fetchEnrollments = async () => {
//     try {
//       setLoading(true);
//       const data = await enrollmentService.getMyEnrollments();
//       const enrollmentsList = data.data?.enrollments || data || [];
//       setEnrollments(enrollmentsList);

//       // Calculate stats
//       const stats = {
//         totalCourses: enrollmentsList.length,
//         completedCourses: enrollmentsList.filter(e => e.completionStatus === 'COMPLETED').length,
//         inProgressCourses: enrollmentsList.filter(e => e.completionStatus === 'IN_PROGRESS').length,
//         averageProgress: enrollmentsList.length > 0
//           ? Math.round(enrollmentsList.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollmentsList.length)
//           : 0
//       };
//       setStats(stats);
//     } catch (error) {
//       console.error('Error fetching enrollments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         {/* Header with XP & Level */}
//         <div className="mb-8 bg-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
//           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
//             <div className="flex items-center gap-6">
//               <div className="relative">
//                 <img
//                   src={user?.profilePicture}
//                   alt="Profile"
//                   className="w-24 h-24 rounded-full border-4 border-blue-400 shadow-xl"
//                 />
//                 <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-blue-900 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-4 border-blue-900 shadow-lg">
//                   {user?.level || 1}
//                 </div>
//               </div>
//               <div>
//                 <h1 className="text-3xl font-black mb-1">
//                   Welcome back, {user?.firstName}! 👋
//                 </h1>
//                 <p className="text-blue-200">Level {user?.level || 1} Scholar</p>
//               </div>
//             </div>

//             <div className="flex-1 max-w-md w-full">
//               <div className="flex justify-between items-end mb-2">
//                 <span className="text-xs font-bold uppercase tracking-wider text-blue-300">XP Progress</span>
//                 <span className="text-sm font-black text-yellow-400">{user?.xp % 1000} / 1000 XP</span>
//               </div>
//               <div className="w-full bg-blue-950/50 rounded-full h-4 p-1 shadow-inner">
//                 <div
//                   className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-1000"
//                   style={{ width: `${(user?.xp % 1000) / 10}%` }}
//                 ></div>
//               </div>
//               <p className="text-[10px] text-blue-300 mt-2 text-right italic">
//                 {1000 - (user?.xp % 1000)} XP until level {(user?.level || 1) + 1}!
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <StatCard
//             title="Total Courses"
//             value={stats.totalCourses}
//             icon="📚"
//             color="bg-blue-500"
//           />
//           <StatCard
//             title="In Progress"
//             value={stats.inProgressCourses}
//             icon="🔄"
//             color="bg-yellow-500"
//           />
//           <StatCard
//             title="Completed"
//             value={stats.completedCourses}
//             icon="✅"
//             color="bg-green-500"
//           />
//           <StatCard
//             title="Avg Progress"
//             value={`${stats.averageProgress}%`}
//             icon="📊"
//             color="bg-purple-500"
//           />
//         </div>

//         {/* Quick Actions */}
//         {/* Quick Actions & Badges */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//           <div className="lg:col-span-2">
//             <div className="flex gap-4">
//               <Link
//                 to="/courses"
//                 className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition font-bold text-center shadow-lg shadow-blue-200"
//               >
//                 Browse Courses
//               </Link>
//               <Link
//                 to="/student/courses"
//                 className="flex-1 bg-white text-gray-700 px-6 py-4 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition font-bold text-center shadow-sm"
//               >
//                 My Courses
//               </Link>
//             </div>
//           </div>

//           <div className="bg-white rounded-3xl p-6 border-2 border-gray-50 shadow-sm flex flex-col justify-center">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-black text-gray-800">My Badges</h3>
//               <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-full">
//                 {user?.badges?.length || 0} Earned
//               </span>
//             </div>
//             <div className="flex gap-3 overflow-x-auto pb-2">
//               {user?.badges?.length > 0 ? (
//                 user.badges.map((ub) => (
//                   <div key={ub.id} className="flex-shrink-0 group relative">
//                     <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl border-2 border-yellow-100 group-hover:scale-110 transition-transform cursor-pointer">
//                       {ub.badge?.icon || '🏅'}
//                     </div>
//                     {/* Tooltip */}
//                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-32 bg-gray-900 text-white text-[10px] p-2 rounded-lg text-center z-20">
//                       <div className="font-bold border-b border-gray-700 mb-1 pb-1">{ub.badge?.name}</div>
//                       {ub.badge?.description}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-xs text-gray-400 italic">Complete lessons to earn badges!</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Recent Enrollments */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">My Courses</h2>

//           {enrollments.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
//               <Link
//                 to="/courses"
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Browse available courses →
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {enrollments.slice(0, 5).map((enrollment) => (
//                 <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
//               ))}
//               {enrollments.length > 5 && (
//                 <Link
//                   to="/student/courses"
//                   className="block text-center text-blue-600 hover:text-blue-700 font-medium py-4"
//                 >
//                   View all courses →
//                 </Link>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ title, value, icon, color }) => (
//   <div className="bg-white rounded-lg shadow-md p-6">
//     <div className="flex items-center justify-between mb-2">
//       <span className="text-2xl">{icon}</span>
//       <span className={`${color} text-white text-sm px-3 py-1 rounded-full`}>
//         {value}
//       </span>
//     </div>
//     <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
//   </div>
// );

// const EnrollmentCard = ({ enrollment }) => {
//   const course = enrollment.course;
//   const progress = enrollment.progressPercentage || 0;

//   return (
//     <Link
//       to={`/student/courses/${course.id}/learn`}
//       className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
//     >
//       <div className="flex items-center gap-4 flex-1">
//         <img
//           src={course.thumbnailImage || 'https://via.placeholder.com/80'}
//           alt={course.title}
//           className="w-20 h-20 object-cover rounded-lg"
//         />
//         <div className="flex-1">
//           <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
//           <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
//             <span className={`px-2 py-1 rounded ${enrollment.completionStatus === 'COMPLETED'
//               ? 'bg-green-100 text-green-700'
//               : 'bg-yellow-100 text-yellow-700'
//               }`}>
//               {enrollment.completionStatus === 'COMPLETED' ? 'Completed' : 'In Progress'}
//             </span>
//             {enrollment.lastAccessed && (
//               <span>Last accessed: {new Date(enrollment.lastAccessed).toLocaleDateString()}</span>
//             )}
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-blue-600 h-2 rounded-full transition-all"
//               style={{ width: `${progress}%` }}
//             ></div>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
//         </div>
//       </div>
//       <div className="ml-4 flex flex-col gap-2">
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm whitespace-nowrap">
//           {progress === 100 ? 'Review' : 'Continue'}
//         </button>

//         {enrollment.completionStatus === 'COMPLETED' && enrollment.certificate && (
//           <Link
//             to={`/student/certificates/${enrollment.certificate.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition text-sm font-bold text-center whitespace-nowrap"
//           >
//             📜 Certificate
//           </Link>
//         )}
//       </div>
//     </Link>
//   );
// };

// export default StudentDashboard;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import enrollmentService from '../../services/enrollmentService';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  PlayCircle,
  CheckCircle,
  Award,
  Zap,
  Target,
  ChevronRight,
  Sparkles,
  Star,
  Calendar,
  ArrowRight
} from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const currentLevel = user?.level || 1;
  const currentXP = user?.xp || 0;
  const xpInCurrentLevel = currentXP % 1000;
  const xpToNextLevel = 1000 - xpInCurrentLevel;
  const xpProgress = (xpInCurrentLevel / 1000) * 100;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header with Level & XP */}
        <div className="mb-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Profile Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md group-hover:blur-lg transition-all"></div>
                  <img
                    src={user?.profilePicture || 'https://via.placeholder.com/96'}
                    alt="Profile"
                    className="relative w-24 h-24 rounded-full border-4 border-white shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-4 border-indigo-600 shadow-lg">
                    {currentLevel}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      Welcome back, {user?.firstName}!
                    </h1>
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <p className="text-indigo-100 font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Level {currentLevel} Scholar
                  </p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="w-full lg:w-auto lg:min-w-[320px]">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">XP Progress</span>
                  <span className="text-sm font-black text-yellow-300 flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {xpInCurrentLevel} / 1000 XP
                  </span>
                </div>
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-4 p-1 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 h-full rounded-full shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all duration-1000"
                    style={{ width: `${xpProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-indigo-200 mt-2 text-right font-medium flex items-center justify-end gap-1">
                  <Target className="w-3 h-3" />
                  {xpToNextLevel} XP until level {currentLevel + 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-50"
            borderColor="border-blue-100"
            trend="Enrolled"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressCourses}
            icon={<PlayCircle className="w-6 h-6 text-amber-600" />}
            bgColor="bg-amber-50"
            borderColor="border-amber-100"
            trend="Active"
          />
          <StatCard
            title="Completed"
            value={stats.completedCourses}
            icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
            trend="Finished"
          />
          <StatCard
            title="Avg Progress"
            value={`${stats.averageProgress}%`}
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            bgColor="bg-purple-50"
            borderColor="border-purple-100"
            trend="Overall"
          />
        </div>

        {/* Quick Actions & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Quick Actions */}
          <div className="lg:col-span-2 flex gap-4">
            <Link
              to="/courses"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-3xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold text-center shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 group"
            >
              <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Browse Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/student/courses"
              className="flex-1 bg-white text-slate-700 px-8 py-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all font-bold text-center shadow-sm flex items-center justify-center gap-3 group"
            >
              <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              My Courses
            </Link>
          </div>

          {/* Badges Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                My Badges
              </h3>
              <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {user?.badges?.length || 0} Earned
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {user?.badges && user.badges.length > 0 ? (
                user.badges.map((ub) => (
                  <div key={ub.id} className="flex-shrink-0 group relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl flex items-center justify-center text-2xl border-2 border-yellow-200 group-hover:scale-110 group-hover:shadow-lg transition-all cursor-pointer">
                      {ub.badge?.icon || '🏅'}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-40 bg-slate-900 text-white text-xs p-3 rounded-xl text-center z-20 shadow-xl">
                      <div className="font-bold border-b border-slate-700 mb-2 pb-2">{ub.badge?.name}</div>
                      <div className="text-slate-300">{ub.badge?.description}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center py-4">
                  <p className="text-xs text-slate-400 italic flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Complete lessons to earn badges!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
              <p className="text-sm text-slate-500 mt-1">Continue your learning journey</p>
            </div>
            {enrollments.length > 0 && (
              <Link
                to="/student/courses"
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-6 text-lg font-semibold">You haven't enrolled in any courses yet</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200"
              >
                Browse Courses
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.slice(0, 5).map((enrollment) => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, borderColor, trend }) => (
  <div className={`bg-white rounded-3xl p-6 border ${borderColor} shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
    </div>
    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-end gap-3">
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold text-slate-400 mb-1.5">{trend}</p>
    </div>
  </div>
);

const EnrollmentCard = ({ enrollment }) => {
  const course = enrollment.course;
  const progress = enrollment.progressPercentage || 0;
  const isCompleted = enrollment.completionStatus === 'COMPLETED';

  return (
    <Link
      to={`/student/courses/${course.id}/learn`}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 border border-slate-100 rounded-3xl hover:shadow-lg hover:border-indigo-100 transition-all group bg-white"
    >
      {/* Course Thumbnail */}
      <div className="relative flex-shrink-0 w-full sm:w-32 h-32 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/128'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="flex-1 w-full">
        <h3 className="font-bold text-slate-900 mb-2 text-lg group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Completed
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <PlayCircle className="w-3 h-3" />
                In Progress
              </span>
            )}
          </span>
          
          {enrollment.lastAccessed && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(enrollment.lastAccessed).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600">Progress</span>
            <span className="text-xs font-black text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
        <button className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap ${
          isCompleted
            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
        }`}>
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Review
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Continue
            </>
          )}
        </button>

        {isCompleted && enrollment.certificate && (
          <Link
            to={`/student/certificates/${enrollment.certificate.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-center whitespace-nowrap shadow-lg shadow-yellow-200 flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            Certificate
          </Link>
        )}
      </div>
    </Link>
  );
};

export default StudentDashboard;