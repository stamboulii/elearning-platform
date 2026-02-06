import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import courseService from '../services/courseService';
import categoryService from '../services/categoryService';
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Search,
  Zap,
  DollarSign,
  User,
  Sparkles
} from 'lucide-react';

// Step Card Component
const StepCard = ({ number, title, description, icon }) => (
  <div className="relative z-10 flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
    <div className="absolute -top-4 -right-4 text-6xl font-black text-slate-50 dark:text-slate-800/50 group-hover:text-indigo-50 dark:group-hover:text-indigo-900/20 transition-colors">
      {number}
    </div>
    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
  </div>
);

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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-purple-50/50 dark:bg-purple-900/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Sparkles className="w-4 h-4" />
                <span>Modern E-Learning Platform</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
                Master New Skills <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Without Limits.</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                Join a community of 10,000+ students. Learn from industry experts and advance your career with our professional-grade curriculum.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-1000">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-200 dark:hover:shadow-indigo-900/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      Start Learning Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/courses"
                      className="w-full sm:w-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-10 py-4 rounded-2xl font-bold text-lg border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      Browse Catalog
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/courses"
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    Continue Journey
                  </Link>
                )}
              </div>

              <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start opacity-70">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 object-cover" alt="Student" />
                  ))}
                </div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <span className="text-slate-900 dark:text-white">4.8/5</span> from 2,000+ reviews
                </div>
              </div>
            </div>

            <div className="flex-1 w-full max-w-2xl relative animate-in fade-in zoom-in duration-1000 delay-300">
              <div className="relative z-10 bg-white dark:bg-slate-900 p-4 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800"
                  alt="Students learning"
                  className="rounded-[32px] w-full h-[500px] object-cover"
                />

                {/* Floating UI Elements */}
                <div className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce-slow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">Expert Verified</div>
                      <div className="text-xs text-slate-500">Premium Content</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-8 -right-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 animate-float">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Play className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">500+ Lessons</div>
                      <div className="text-xs text-slate-500">Interactive Video</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard icon={<Users className="w-6 h-6" />} number="10,000+" label="Students" color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" />
            <StatCard icon={<BookOpen className="w-6 h-6" />} number="500+" label="Courses" color="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" />
            <StatCard icon={<GraduationCap className="w-6 h-6" />} number="100+" label="Instructors" color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" />
            <StatCard icon={<Award className="w-6 h-6" />} number="50+" label="Categories" color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" />
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
            {categories.map((category, idx) => (
              <CategoryCard key={category.id} category={category} index={idx} />
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

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Start your learning journey in three simple steps and unlock your potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-slate-100 dark:bg-slate-800 border-t-2 border-dashed border-slate-200 dark:border-slate-700 -z-0"></div>

            <StepCard
              number="01"
              title="Create Account"
              description="Join for free as a student or instructor and set up your professional profile."
              icon={<User className="w-8 h-8" />}
            />
            <StepCard
              number="02"
              title="Select Your Course"
              description="Browse 500+ courses across various domains verified by industry experts."
              icon={<Search className="w-8 h-8" />}
            />
            <StepCard
              number="03"
              title="Start Learning"
              description="Access interactive lessons, quizzes, and earn your certificate of completion."
              icon={<Zap className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
                Top Rated Courses
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Industry-leading curriculum designed to take your skills to the next level.
              </p>
            </div>
            <Link
              to="/courses"
              className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm hidden md:block"
            >
              Explore Full Library
            </Link>
          </div>

          {featuredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-xl font-bold text-slate-400">Class starts soon! No courses live yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link
              to="/courses"
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition inline-block w-full"
            >
              See All 500+ Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-[40px] p-8 md:p-16 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                {user?.role === 'INSTRUCTOR' ? 'Ready to Create Your Next Course?' : 'Inspire Others & Share Your Expertise'}
              </h2>
              <p className="text-xl mb-10 text-indigo-100/90 leading-relaxed">
                {user?.role === 'INSTRUCTOR'
                  ? 'Join our top-tier instructors and scale your teaching career with our advanced course builder.'
                  : 'Start teaching today and join our community of 100+ expert instructors from around the world.'
                }
              </p>
              <button
                onClick={() => {
                  if (!user) navigate('/register?role=instructor');
                  else if (user.role === 'INSTRUCTOR') navigate('/instructor/courses/create');
                  else navigate('/instructor/dashboard');
                }}
                className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 hover:scale-105 transition-all shadow-xl"
              >
                {user?.role === 'INSTRUCTOR' ? 'Create New Course' : 'Start Teaching Today'}
              </button>
            </div>
            <div className="w-full max-w-sm">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold opacity-80 uppercase">Potential Earnings</div>
                    <div className="text-2xl font-black">$2,000 - $10,000+</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 w-3/4"></div>
                  </div>
                  <div className="flex justify-between text-xs font-bold opacity-70">
                    <span>Active Courses</span>
                    <span>92% Success Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Stat Item Component
const StatCard = ({ icon, number, label, color }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6`}>
      {icon}
    </div>
    <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">{number}</div>
    <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs">{label}</div>
  </div>
);

// Category Card Component
const CategoryCard = ({ category, index }) => {
  const navigate = useNavigate();
  const colors = [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-purple-50 text-purple-600 border-purple-100',
    'bg-indigo-50 text-indigo-600 border-indigo-100',
    'bg-emerald-50 text-emerald-600 border-emerald-100',
    'bg-amber-50 text-amber-600 border-amber-100',
    'bg-rose-50 text-rose-600 border-rose-100',
    'bg-cyan-50 text-cyan-600 border-cyan-100',
    'bg-orange-50 text-orange-600 border-orange-100'
  ];

  const colorStyle = colors[index % colors.length];

  return (
    <div
      onClick={() => navigate(`/courses?category=${category.id}`)}
      className="bg-white dark:bg-slate-900 flex flex-col items-center p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-600 dark:hover:border-indigo-500 transition-all cursor-pointer group hover:-translate-y-2"
    >
      <div className={`w-16 h-16 ${colorStyle} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
        {category.icon || '📚'}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{category.name}</h3>
      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {category._count?.courses || 0} Open Courses
        </p>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all cursor-pointer overflow-hidden group border-b-4 hover:border-b-indigo-600 dark:hover:border-b-indigo-500"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-sm">
            {course.level}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 h-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <img src={`https://i.pravatar.cc/150?u=${course.instructor?.id}`} className="w-6 h-6 rounded-full" alt="I" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-tight">
            {course.instructor?.firstName} {course.instructor?.lastName}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-amber-700 dark:text-amber-400">
              {course.averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ${course.discountPrice || course.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;