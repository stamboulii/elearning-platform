// /* eslint-disable no-unused-vars */
// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import courseService from '../../services/courseService';
// import enrollmentService from '../../services/enrollmentService';

// const MyCourses = () => {
//   const navigate = useNavigate();
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('ALL');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortBy, setSortBy] = useState('newest');

//   useEffect(() => {
//     fetchCourses();
//   }, []); // Empty dependency array is fine here

//   const fetchCourses = async () => {
//     try {
//       setLoading(true);
//       const data = await courseService.getInstructorCourses();
//       setCourses(data);
//     } catch (error) {
//       console.error('Error fetching courses:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteCourse = async (courseId, courseTitle) => {
//     if (!confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await courseService.deleteCourse(courseId);
//       alert('Course deleted successfully');
//       fetchCourses();
//     } catch (error) {
//       console.error('Error deleting course:', error);
//       alert(error.response?.data?.message || 'Failed to delete course');
//     }
//   };

//   // Filter courses
//   const filteredCourses = courses.filter(course => {
//     if (filter !== 'ALL' && course.status !== filter) {
//       return false;
//     }

//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       return (
//         course.title.toLowerCase().includes(query) ||
//         course.shortDescription.toLowerCase().includes(query)
//       );
//     }

//     return true;
//   });

//   // Sort courses
//   const sortedCourses = [...filteredCourses].sort((a, b) => {
//     switch (sortBy) {
//       case 'newest':
//         return new Date(b.createdAt) - new Date(a.createdAt);
//       case 'oldest':
//         return new Date(a.createdAt) - new Date(b.createdAt);
//       case 'title':
//         return a.title.localeCompare(b.title);
//       case 'students':
//         return b._count.enrollments - a._count.enrollments;
//       default:
//         return 0;
//     }
//   });

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
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
//             <p className="text-gray-600">Manage and track your courses</p>
//           </div>
//           <Link
//             to="/instructor/courses/create"
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
//           >
//             + Create New Course
//           </Link>
//         </div>

//         {/* Stats Summary */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <StatCard
//             title="Total Courses"
//             value={courses.length}
//             icon="📚"
//             color="bg-blue-500"
//           />
//           <StatCard
//             title="Published"
//             value={courses.filter(c => c.status === 'PUBLISHED').length}
//             icon="✅"
//             color="bg-green-500"
//           />
//           <StatCard
//             title="Drafts"
//             value={courses.filter(c => c.status === 'DRAFT').length}
//             icon="📝"
//             color="bg-yellow-500"
//           />
//           <StatCard
//             title="Total Students"
//             value={courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
//             icon="👥"
//             color="bg-purple-500"
//           />
//         </div>

//         {/* Filters and Search */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div className="md:col-span-1">
//               <input
//                 type="text"
//                 placeholder="Search courses..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             {/* Status Filter */}
//             <div>
//               <select
//                 value={filter}
//                 onChange={(e) => setFilter(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="ALL">All Status</option>
//                 <option value="PUBLISHED">Published</option>
//                 <option value="DRAFT">Draft</option>
//                 <option value="ARCHIVED">Archived</option>
//               </select>
//             </div>

//             {/* Sort By */}
//             <div>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="newest">Newest First</option>
//                 <option value="oldest">Oldest First</option>
//                 <option value="title">Title (A-Z)</option>
//                 <option value="students">Most Students</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Courses List */}
//         {sortedCourses.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-md p-12 text-center">
//             <div className="text-6xl mb-4">📚</div>
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">
//               {searchQuery || filter !== 'ALL' ? 'No courses found' : 'No courses yet'}
//             </h3>
//             <p className="text-gray-600 mb-6">
//               {searchQuery || filter !== 'ALL'
//                 ? 'Try adjusting your filters or search query'
//                 : 'Create your first course to get started'}
//             </p>
//             {!searchQuery && filter === 'ALL' && (
//               <Link
//                 to="/instructor/courses/create"
//                 className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
//               >
//                 Create Your First Course
//               </Link>
//             )}
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-6">
//             {sortedCourses.map((course) => (
//               <CourseCard
//                 key={course.id}
//                 course={course}
//                 onDelete={handleDeleteCourse}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Stat Card Component
// const StatCard = ({ title, value, icon, color }) => (
//   <div className="bg-white rounded-lg shadow-md p-6">
//     <div className="flex items-center justify-between mb-2">
//       <span className="text-3xl">{icon}</span>
//       <span className={`${color} text-white text-lg px-4 py-1 rounded-full font-bold`}>
//         {value}
//       </span>
//     </div>
//     <h3 className="text-gray-600 font-medium">{title}</h3>
//   </div>
// );

// // Course Card Component
// const CourseCard = ({ course, onDelete }) => {
//   const navigate = useNavigate();
//   const [showMenu, setShowMenu] = useState(false);
//   const [stats, setStats] = useState(null);

//   // Navigate is used in onClick handlers below

//   useEffect(() => {
//     const fetchStats = async () => {
//       if (course.status !== 'PUBLISHED') return;

//       try {
//         const response = await enrollmentService.getCourseStats(course.id);
//         setStats(response);
//       } catch (error) {
//         console.error('Error fetching stats:', error);
//       }
//     };

//     fetchStats();
//   }, [course.id, course.status]); // Add dependencies

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'PUBLISHED':
//         return 'bg-green-100 text-green-700';
//       case 'DRAFT':
//         return 'bg-yellow-100 text-yellow-700';
//       case 'ARCHIVED':
//         return 'bg-gray-100 text-gray-700';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
//       <div className="flex flex-col md:flex-row">
//         {/* Thumbnail */}
//         <div className="md:w-64 h-48 md:h-auto relative">
//           <img
//             src={course.thumbnailImage || 'https://via.placeholder.com/400x300'}
//             alt={course.title}
//             className="w-full h-full object-cover"
//           />
//           <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
//             {course.status}
//           </span>
//         </div>

//         {/* Content */}
//         <div className="flex-1 p-6">
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex-1">
//               <h3 
//                 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer"
//                 onClick={() => navigate(`/instructor/courses/${course.id}`)}
//               >
//                 {course.title}
//               </h3>
//               <p className="text-gray-600 text-sm line-clamp-2">{course.shortDescription}</p>
//             </div>

//             {/* Menu Button */}
//             <div className="relative ml-4">
//               <button
//                 onClick={() => setShowMenu(!showMenu)}
//                 className="p-2 hover:bg-gray-100 rounded-full transition"
//               >
//                 <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
//                 </svg>
//               </button>

//               {/* Dropdown Menu */}
//               {showMenu && (
//                 <>
//                   <div 
//                     className="fixed inset-0 z-10" 
//                     onClick={() => setShowMenu(false)}
//                   />
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
//                     <button
//                       onClick={() => {
//                         navigate(`/instructor/courses/${course.id}`);
//                         setShowMenu(false);
//                       }}
//                       className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                     >
//                       View Details
//                     </button>
//                     <button
//                       onClick={() => {
//                         navigate(`/instructor/courses/${course.id}/builder`);
//                         setShowMenu(false);
//                       }}
//                       className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                     >
//                       Edit Content
//                     </button>
//                     <button
//                       onClick={() => {
//                         navigate(`/instructor/courses/${course.id}/edit`);
//                         setShowMenu(false);
//                       }}
//                       className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
//                     >
//                       Edit Info
//                     </button>
//                     <hr className="my-2" />
//                     <button
//                       onClick={() => {
//                         onDelete(course.id, course.title);
//                         setShowMenu(false);
//                       }}
//                       className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
//             <StatItem icon="💰" label="Price" value={`$${course.price}`} />
//             <StatItem icon="👥" label="Students" value={course._count.enrollments} />
//             <StatItem icon="📚" label="Sections" value={course._count.sections} />
//             <StatItem icon="⭐" label="Reviews" value={course._count.reviews} />
//             <StatItem icon="📊" label="Level" value={course.level} />
//           </div>

//           {/* Additional Stats for Published Courses */}
//           {course.status === 'PUBLISHED' && stats && (
//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <div className="flex items-center gap-6 text-sm">
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-600">Completed:</span>
//                   <span className="font-semibold text-green-600">
//                     {stats.completedEnrollments}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-600">In Progress:</span>
//                   <span className="font-semibold text-blue-600">
//                     {stats.inProgressEnrollments}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-gray-600">Avg Progress:</span>
//                   <span className="font-semibold text-purple-600">
//                     {stats.averageProgress}%
//                   </span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div className="flex gap-3 mt-4">
//             <button
//               onClick={() => navigate(`/instructor/courses/${course.id}/builder`)}
//               className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
//             >
//               Manage Content
//             </button>
//             <button
//               onClick={() => navigate(`/instructor/courses/${course.id}`)}
//               className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
//             >
//               View Analytics
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Stat Item Component
// const StatItem = ({ icon, label, value }) => (
//   <div className="text-center">
//     <div className="text-2xl mb-1">{icon}</div>
//     <div className="text-xs text-gray-600 mb-1">{label}</div>
//     <div className="font-semibold text-gray-800">{value}</div>
//   </div>
// );

// export default MyCourses;

/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle,
  FileText,
  Archive,
  Plus,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Users,
  Star,
  Layers,
  DollarSign,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Clock,
  Award,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const hasActiveFilters = filter !== 'ALL' || searchQuery;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Courses</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and track your courses</p>
            </div>
          </div>
          <Link
            to="/instructor/courses/create"
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-3 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Create New Course
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon={<BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
            borderColor="border-indigo-100 dark:border-indigo-800"
          />
          <StatCard
            title="Published"
            value={courses.filter(c => c.status === 'PUBLISHED').length}
            icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            bgColor="bg-emerald-50 dark:bg-emerald-900/20"
            borderColor="border-emerald-100 dark:border-emerald-800"
          />
          <StatCard
            title="Drafts"
            value={courses.filter(c => c.status === 'DRAFT').length}
            icon={<FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            bgColor="bg-amber-50 dark:bg-amber-900/20"
            borderColor="border-amber-100 dark:border-amber-800"
          />
          <StatCard
            title="Total Students"
            value={courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
            icon={<Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
            bgColor="bg-purple-50 dark:bg-purple-900/20"
            borderColor="border-purple-100 dark:border-purple-800"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="students">Most Students</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                  Search: "{searchQuery}"
                </span>
              )}
              {filter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-800">
                  Status: {filter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('ALL');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Courses List */}
        {sortedCourses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {hasActiveFilters ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'Create your first course to get started'}
            </p>
            {!hasActiveFilters ? (
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                <Plus className="w-5 h-5" />
                Create Your First Course
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('ALL');
                }}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                Clear Filters
              </button>
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
const StatCard = ({ title, value, icon, bgColor, borderColor }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border ${borderColor} dark:border-slate-800 shadow-sm hover:shadow-md transition-all group`}>
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
  </div>
);

// Course Card Component
const CourseCard = ({ course, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [stats, setStats] = useState(null);

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
  }, [course.id, course.status]);

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
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all group">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-80 h-56 md:h-auto relative flex-shrink-0">
          <img
            src={course.thumbnailImage || 'https://via.placeholder.com/400x300'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusConfig.color} dark:bg-slate-900/80 backdrop-blur-sm flex items-center gap-1`}>
            {statusConfig.icon}
            {course.status}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3
                className="text-xl font-bold text-slate-900 mb-3 hover:text-indigo-600 cursor-pointer transition-colors"
                onClick={() => navigate(`/instructor/courses/${course.id}`)}
              >
                {course.title}
              </h3>
              <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{course.shortDescription}</p>
            </div>

            {/* Menu Button */}
            <div className="relative ml-6">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold text-sm">View Details</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}/builder`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Layers className="w-4 h-4" />
                      <span className="font-semibold text-sm">Edit Content</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/instructor/courses/${course.id}/edit`);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="font-semibold text-sm">Edit Info</span>
                    </button>
                    <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                    <button
                      onClick={() => {
                        onDelete(course.id, course.title);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-semibold text-sm">Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
            <StatItem icon={<DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} label="Price" value={`$${course.price}`} />
            <StatItem icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />} label="Students" value={course._count.enrollments} />
            <StatItem icon={<Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />} label="Sections" value={course._count.sections} />
            <StatItem icon={<Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />} label="Reviews" value={course._count.reviews} />
            <StatItem icon={<Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />} label="Level" value={course.level} />
          </div>

          {/* Additional Stats for Published Courses */}
          {course.status === 'PUBLISHED' && stats && (
            <div className="mb-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Completed:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {stats.completedEnrollments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">In Progress:</span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {stats.inProgressEnrollments}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Avg Progress:</span>
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {stats.averageProgress}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}/builder`)}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Manage Content
            </button>
            <button
              onClick={() => navigate(`/instructor/courses/${course.id}`)}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
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
  <div className="flex flex-col items-center text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
    <div className="mb-2">{icon}</div>
    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-sm font-black text-slate-900 dark:text-white">{value}</div>
  </div>
);

export default MyCourses;