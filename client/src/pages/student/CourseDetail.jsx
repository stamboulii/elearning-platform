import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import api from '../../services/api';
import toast from '../../utils/toast';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  ChevronRight,
  CheckCircle,
  Play,
  Award,
  Download,
  Smartphone,
  Infinity,
  Globe,
  Calendar,
  ShoppingCart,
  Sparkles,
  Eye,
  Shield
} from 'lucide-react';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStickyBar, setShowStickyBar] = useState(false);

  const heroRef = useRef(null);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse(id);
      setCourse(courseData);

      if (user) {
        const [enrollmentData, cartData] = await Promise.all([
          enrollmentService.checkEnrollment(id),
          api.get(`/cart/check/${id}`)
        ]);
        setEnrollmentStatus(enrollmentData);
        setIsInCart(cartData.data?.success ? cartData.data.data.isInCart : false);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user]);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowStickyBar(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    if (isInCart) {
      navigate('/cart');
      return;
    }

    if (!course.isFree && parseFloat(course.price) > 0) {
      try {
        setEnrolling(true);
        const response = await api.post('/cart', { courseId: id });

        if (response.data.success) {
          setIsInCart(true);
          window.dispatchEvent(new Event('cart-updated'));
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert(error.response?.data?.message || 'Failed to add to cart');
      } finally {
        setEnrolling(false);
      }
      return;
    }

    try {
      setEnrolling(true);
      await enrollmentService.enrollInCourse(id);
      toast.success('Successfully enrolled in course!');
      navigate(`/student/courses/${id}/learn`);
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartFreeLessons = () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    navigate(`/student/courses/${id}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
            {t('student.course_detail.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.sections?.reduce((sum, section) => sum + (section.lessons?.length || 0), 0) || 0;
  const totalDuration = course.sections?.reduce((sum, section) =>
    sum + (section.lessons?.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0) || 0), 0) || 0;
  const freeLessonsCount = course.sections?.reduce((sum, section) =>
    sum + (section.lessons?.filter(l => l.isPreview || l.isFree).length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      {/* Sticky Purchase Bar */}
      <div className={`fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-lg z-50 transform transition-transform duration-300 border-b border-slate-100 dark:border-slate-800 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[300px]">{course.title}</h2>
            <div className="hidden sm:flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-900 dark:text-white">{course.averageRating?.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{course.discountPrice || course.price}€</span>
            </div>
            <button
              onClick={handleEnroll}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {enrollmentStatus?.isEnrolled ? t('student.course_detail.go_to_course') : isInCart ? t('student.course_detail.go_to_cart') : (course.isFree || course.price === 0) ? t('student.course_detail.enroll_now') : t('student.course_detail.buy_now')}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm font-semibold text-indigo-300 mb-6">
                <Link to="/courses" className="hover:text-white cursor-pointer transition-colors">{t('student.course_detail.courses')}</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="hover:text-white cursor-pointer transition-colors">{course.category?.name}</span>
              </nav>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                {course.title}
              </h1>

              <p className="text-xl text-indigo-100 mb-8 max-w-2xl leading-relaxed">
                {course.shortDescription}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-xl border border-amber-400/30">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span className="font-bold text-amber-100">
                    {course.averageRating?.toFixed(1) || '0.0'} ({course.totalReviews || 0} {t('student.course_detail.reviews')})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{course.totalEnrollments || 0} {t('student.course_detail.students')}</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Calendar className="w-4 h-4" />
                  <span>{t('student.course_detail.updated')} {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Purchase Box */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white">{course.discountPrice || course.price}€</span>
                    {course.discountPrice && (
                      <span className="text-xl text-indigo-300 line-through">{course.price}€</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="flex-1 md:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white px-10 py-4 rounded-2xl font-black text-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2"
                    >
                      {enrolling ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : enrollmentStatus?.isEnrolled ? (
                        <>
                          <Play className="w-5 h-5" />
                          {t('student.course_detail.go_to_course')}
                        </>
                      ) : isInCart ? (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          {t('student.course_detail.go_to_cart')}
                        </>
                      ) : (course.isFree || course.price === 0) ? (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {t('student.course_detail.enroll_free')}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          {t('student.course_detail.buy_now')}
                        </>
                      )}
                    </button>
                    {!enrollmentStatus?.isEnrolled && freeLessonsCount > 0 && (
                      <button
                        onClick={handleStartFreeLessons}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-bold transition-all border border-white/20 flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        {t('student.course_detail.try_preview')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="mt-8 flex items-center gap-4">
                <img
                  src={course.instructor?.profilePicture || 'https://via.placeholder.com/60'}
                  className="w-14 h-14 rounded-full border-2 border-indigo-400 shadow-xl object-cover ring-4 ring-indigo-500/20"
                  alt="Instructor"
                />
                <div>
                  <p className="text-sm text-indigo-300 font-medium">{t('student.course_detail.created_by')}</p>
                  <p className="font-bold text-lg text-white">{course.instructor?.firstName} {course.instructor?.lastName}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative group cursor-pointer aspect-video" onClick={handleStartFreeLessons}>
                  <img
                    src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-indigo-600 fill-indigo-600 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold text-sm border border-white/20">
                      <Eye className="w-4 h-4" />
                      {t('student.course_detail.course_preview')}
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 grid grid-cols-3 gap-4">
                  <HeroStat icon={<Clock className="w-5 h-5" />} text={`${course.estimatedDuration || Math.floor(totalDuration / 60)}h`} />
                  <HeroStat icon={<BookOpen className="w-5 h-5" />} text={`${totalLessons} ${t('student.course_detail.lessons')}`} />
                  <HeroStat icon={<Globe className="w-5 h-5" />} text={course.language === 'en' ? 'English' : 'French'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* What you'll learn */}
            {course.outcomes?.length > 0 && (
              <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  {t('student.course_detail.what_you_learn')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{outcome.outcome}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Course Content */}
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  {t('student.course_detail.course_content')}
                </h2>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                  {course.sections?.length} {t('student.course_detail.sections')} - {totalLessons} {t('student.course_detail.lessons')} - {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
              </div>
              <CurriculumTab sections={course.sections} />
            </section>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="flex border-b border-slate-100 dark:border-slate-800">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label={t('student.course_detail.overview')} />
                <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} label={t('student.course_detail.reviews')} />
              </div>
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">{t('student.course_detail.description')}</h3>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {course.fullDescription || course.shortDescription}
                    </div>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <ReviewsTab reviews={course.reviews} courseId={course.id} />
                )}
              </div>
            </div>

            {/* Instructor */}
            <InstructorInfo instructor={course.instructor} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <TrustGrid />
              <div className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 rounded-3xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6" />
                  <h4 className="font-bold">{t('student.course_detail.guarantee')}</h4>
                </div>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  {t('student.course_detail.guarantee_text')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroStat = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-2 text-center">
    <div className="text-indigo-300">{icon}</div>
    <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">{text}</span>
  </div>
);

const TrustGrid = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <h4 className="font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">{t('student.course_detail.course_includes')}</h4>
      <div className="space-y-4">
        <FeatureIconBox icon={<Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />} text={t('student.course_detail.mobile_tv_access')} />
        <FeatureIconBox icon={<Infinity className="w-5 h-5 text-purple-600 dark:text-purple-400" />} text={t('student.course_detail.lifetime_access')} />
        <FeatureIconBox icon={<Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />} text={t('student.course_detail.certificate')} />
        <FeatureIconBox icon={<Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} text={t('student.course_detail.resources')} />
      </div>
    </div>
  );
};

const FeatureIconBox = ({ icon, text }) => (
  <div className="flex items-center gap-3 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
      {icon}
    </div>
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{text}</span>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-8 py-4 font-bold transition-all relative ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 rounded-t-full"></div>}
  </button>
);

const CurriculumTab = ({ sections }) => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState([sections?.[0]?.id]);

  const toggleSection = (id) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (!sections?.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center">
        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">{t('student.course_detail.curriculum_preparing')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`transition-transform duration-200 ${expandedSections.includes(section.id) ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
              {section.lessons?.length || 0} {t('student.course_detail.lessons')}
            </span>
          </button>

          {expandedSections.includes(section.id) && (
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              {section.lessons?.map((lesson, lIdx) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 pl-16 hover:bg-white dark:hover:bg-slate-900 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-bold w-6">{lIdx + 1}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.isPreview && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                        <Eye className="w-3 h-3" />
                        {t('student.course_detail.preview')}
                      </span>
                    )}
                    {lesson.isFree && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        {t('student.course_detail.free')}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <Clock className="w-3 h-3" />
                      {lesson.duration} {t('student.course_detail.min')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ReviewsTab = ({ reviews }) => {
  const { t } = useTranslation();
  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mb-3">{avg.toFixed(1)}</div>
          <div className="flex text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <div className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('student.course_detail.course_rating')}</div>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews?.filter(r => Math.round(r.rating) === star).length || 0;
            const perc = reviews?.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="w-16 text-slate-600 dark:text-slate-400 font-semibold text-sm">{star} {t('student.course_detail.stars')}</div>
                <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all" style={{ width: `${perc}%` }}></div>
                </div>
                <div className="w-12 text-slate-500 dark:text-slate-400 text-sm font-bold">{Math.round(perc)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {reviews?.map(review => (
          <div key={review.id} className="flex gap-4 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <img
              src={review.user?.profilePicture || 'https://via.placeholder.com/40'}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
              alt="User"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white">{review.user?.firstName} {review.user?.lastName}</h4>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400' : ''}`} />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{review.reviewText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorInfo = ({ instructor }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        {t('student.course_detail.instructor')}
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center">
          <img
            src={instructor?.profilePicture || 'https://via.placeholder.com/120'}
            className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-indigo-50 dark:ring-indigo-900/30 shadow-lg"
            alt="Instructor"
          />
          <div className="text-center space-y-2">
            <div className="flex items-center gap-1 justify-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">4.8 {t('student.course_detail.rating')}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">1,240 {t('student.course_detail.reviews')}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">10,500 {t('student.course_detail.students')}</div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            {instructor?.firstName} {instructor?.lastName}
          </h3>
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {instructor?.bio || t('student.course_detail.instructor_bio')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
