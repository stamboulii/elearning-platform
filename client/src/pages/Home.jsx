// import { Link } from 'react-router-dom';

// const Home = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Hero Section */}
//       <div className="container mx-auto px-4 py-20">
//         <div className="text-center max-w-4xl mx-auto">
//           <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
//             Learn Anything, Anytime, Anywhere
//           </h1>
//           <p className="text-xl text-gray-600 mb-8">
//             Discover thousands of courses from expert instructors and advance your career
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               to="/courses"
//               className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-lg"
//             >
//               Browse Courses
//             </Link>
//             <Link
//               to="/register"
//               className="bg-white text-blue-600 px-8 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition font-medium text-lg"
//             >
//               Get Started
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Features Section */}
//       <div className="container mx-auto px-4 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <FeatureCard
//             icon="📚"
//             title="Expert Instructors"
//             description="Learn from industry professionals with years of experience"
//           />
//           <FeatureCard
//             icon="🎯"
//             title="Learn at Your Pace"
//             description="Study on your own schedule with lifetime access to courses"
//           />
//           <FeatureCard
//             icon="🏆"
//             title="Get Certified"
//             description="Earn certificates upon course completion to showcase your skills"
//           />
//         </div>
//       </div>

//       {/* Popular Courses Preview */}
//       <div className="bg-white py-16">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
//             Popular Courses
//           </h2>
//           <div className="text-center">
//             <Link
//               to="/courses"
//               className="text-blue-600 hover:text-blue-700 font-medium text-lg"
//             >
//               Explore All Courses →
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* CTA Section */}
//       <div className="bg-blue-600 text-white py-16">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
//           <p className="text-xl mb-8 text-blue-100">
//             Join thousands of students already learning on our platform
//           </p>
//           <Link
//             to="/register"
//             className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium text-lg inline-block"
//           >
//             Sign Up Free
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// const FeatureCard = ({ icon, title, description }) => (
//   <div className="bg-white rounded-lg shadow-md p-6 text-center">
//     <div className="text-5xl mb-4">{icon}</div>
//     <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
//     <p className="text-gray-600">{description}</p>
//   </div>
// );

// export default Home;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import courseService from '../services/courseService';
import categoryService from '../services/categoryService';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        courseService.getAllCourses({ status: 'PUBLISHED', limit: 8 }),
        categoryService.getAllCategories()
      ]);
      setFeaturedCourses(coursesData.data.courses);
      setCategories(categoriesData.slice(0, 8));
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Start, switch, or advance your career with thousands of courses,
              Professional Certificates, and degrees from world-class instructors.
            </p>
            <div className="flex gap-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Join for Free
                  </Link>
                  <Link
                    to="/courses"
                    className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-white"
                  >
                    Explore Courses
                  </Link>
                </>
              ) : (
                <Link
                  to="/courses"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Browse Courses
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem number="10,000+" label="Students" />
            <StatItem number="500+" label="Courses" />
            <StatItem number="100+" label="Expert Instructors" />
            <StatItem number="50+" label="Categories" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Explore Top Categories
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Find the right course for you from our wide range of categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/courses"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Featured Courses
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Explore our most popular courses taught by expert instructors
            </p>
          </div>

          {featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No courses available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/courses"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {user?.role === 'INSTRUCTOR' ? 'Ready to Create Your Next Course?' : 'Become an Instructor Today'}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {user?.role === 'INSTRUCTOR'
              ? 'Share your knowledge and earn money teaching what you love'
              : 'Join thousands of instructors and start earning by teaching online'
            }
          </p>
          <button
            onClick={() => {
              if (!user) {
                navigate('/register?role=instructor');
              } else if (user.role === 'INSTRUCTOR') {
                navigate('/instructor/courses/create');
              } else {
                navigate('/instructor/dashboard');
              }
            }}
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {user?.role === 'INSTRUCTOR' ? 'Create Course' : 'Get Started'}
          </button>
        </div>
      </section>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ number, label }) => (
  <div>
    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{number}</div>
    <div className="text-slate-600 dark:text-slate-400">{label}</div>
  </div>
);

// Category Card Component
const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses?category=${category.id}`)}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition cursor-pointer text-center group"
    >
      <div className="text-4xl mb-3">{category.icon || '📚'}</div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{category.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {category._count?.courses || 0} courses
      </p>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition cursor-pointer overflow-hidden group"
    >
      <img
        src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 h-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {course.instructor?.firstName} {course.instructor?.lastName}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {course.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-500">
              ({course.totalReviews || 0})
            </span>
          </div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            ${course.discountPrice || course.price}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{course.level}</span>
          <span>👥 {course.totalEnrollments || 0} students</span>
        </div>
      </div>
    </div>
  );
};

export default Home;