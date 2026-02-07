/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, curriculum, reviews

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails, id]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourse(id);
      setCourse(courseData);

      // Check enrollment status if user is logged in
      if (user) {
        const enrollmentData = await enrollmentService.checkEnrollment(id);
        setEnrollmentStatus(enrollmentData);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    // If course is not free, redirect to checkout
    if (course.price > 0) {
      navigate(`/checkout?course=${id}`);
      return;
    }

    // Free course - enroll directly
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

  const handleGoToCourse = () => {
    navigate(`/student/courses/${id}/learn`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const totalLessons = course.sections?.reduce((sum, section) =>
    sum + (section.lessons?.length || 0), 0
  ) || 0;

  const totalDuration = course.sections?.reduce((sum, section) =>
    sum + (section.lessons?.reduce((lessonSum, lesson) =>
      lessonSum + (lesson.duration || 0), 0
    ) || 0), 0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-slate-900 dark:to-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-blue-600 dark:bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                  {course.category?.name}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">{course.title}</h1>
              <p className="text-xl text-gray-300 dark:text-slate-300 mb-6">{course.shortDescription}</p>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{course.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-300 dark:text-slate-400">({course.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span>{course.totalEnrollments || 0} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📚</span>
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱</span>
                  <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <img
                  src={course.instructor?.profilePicture || 'https://via.placeholder.com/50'}
                  alt={course.instructor?.firstName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-400 dark:text-slate-400">Created by</p>
                  <p className="font-semibold text-white">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Course Card */}
            <div className="lg:col-span-1">
              <CourseCard
                course={course}
                enrollmentStatus={enrollmentStatus}
                onEnroll={handleEnroll}
                onGoToCourse={handleGoToCourse}
                enrolling={enrolling}
                user={user}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md mb-6 transition-colors">
              <div className="border-b dark:border-slate-700">
                <div className="flex">
                  <TabButton
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    label="Overview"
                  />
                  <TabButton
                    active={activeTab === 'curriculum'}
                    onClick={() => setActiveTab('curriculum')}
                    label="Curriculum"
                  />
                  <TabButton
                    active={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                    label="Reviews"
                  />
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <OverviewTab course={course} />
                )}
                {activeTab === 'curriculum' && (
                  <CurriculumTab sections={course.sections} />
                )}
                {activeTab === 'reviews' && (
                  <ReviewsTab reviews={course.reviews} courseId={course.id} />
                )}
              </div>
            </div>

            {/* Instructor Info */}
            <InstructorInfo instructor={course.instructor} />
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <div className="sticky top-4">
              <CourseFeatures course={course} totalLessons={totalLessons} totalDuration={totalDuration} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Card Component (Sticky on mobile)
const CourseCard = ({ course, enrollmentStatus, onEnroll, onGoToCourse, enrolling, user }) => {
  const isEnrolled = enrollmentStatus?.isEnrolled;
  const isInstructor = user?.id === course.instructor?.id;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden transition-colors">
      {course.previewVideo ? (
        <video
          controls
          poster={course.thumbnailImage}
          className="w-full aspect-video"
        >
          <source src={course.previewVideo} type="video/mp4" />
        </video>
      ) : (
        <img
          src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
          alt={course.title}
          className="w-full aspect-video object-cover"
        />
      )}

      <div className="p-6">
        <div className="mb-6">
          {course.discountPrice && course.discountPrice < course.price ? (
            <div>
              <span className="text-4xl font-bold text-blue-600">
                ${course.discountPrice}
              </span>
              <span className="text-xl text-gray-500 dark:text-slate-400 line-through ml-3">
                ${course.price}
              </span>
              <div className="mt-1 text-sm text-green-600 dark:text-green-400 font-medium">
                Save ${(course.price - course.discountPrice).toFixed(2)}
              </div>
            </div>
          ) : (
            <span className="text-4xl font-bold text-blue-600">
              {course.price === 0 ? 'Free' : `${course.price}`}
            </span>
          )}
        </div>

        {isInstructor ? (
          <button
            onClick={() => window.location.href = `/instructor/courses/${course.id}/builder`}
            className="w-full bg-gray-600 dark:bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 dark:hover:bg-slate-700 transition"
          >
            Manage Course
          </button>
        ) : isEnrolled ? (
          <button
            onClick={onGoToCourse}
            className="w-full bg-green-600 dark:bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-green-700 transition"
          >
            Go to Course
          </button>
        ) : (
          <button
            onClick={onEnroll}
            disabled={enrolling}
            className="w-full bg-blue-600 dark:bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {enrolling ? 'Enrolling...' : course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
          </button>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-3">
          30-Day Money-Back Guarantee
        </p>

        {/* Quick Info */}
        <div className="mt-6 pt-6 border-t dark:border-slate-700 space-y-3">
          <InfoItem icon="⏱" label="Duration" value={`${course.estimatedDuration || 0} hours`} />
          <InfoItem icon="📊" label="Level" value={course.level} />
          <InfoItem icon="🌍" label="Language" value={course.language === 'en' ? 'English' : course.language} />
          <InfoItem icon="📱" label="Access" value="Mobile & Desktop" />
          <InfoItem icon="🎓" label="Certificate" value="Yes" />
        </div>
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium transition ${active
      ? 'text-blue-600 dark:text-indigo-400 border-b-2 border-blue-600 dark:border-indigo-400'
      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
      }`}
  >
    {label}
  </button>
);

// Overview Tab
const OverviewTab = ({ course }) => (
  <div className="space-y-6">
    {/* Description */}
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">About this course</h2>
      <div className="text-gray-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
        {course.fullDescription || course.shortDescription}
      </div>
    </div>

    {/* What you'll learn */}
    {course.outcomes && course.outcomes.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">What you'll learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {course.outcomes.map((outcome, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
              <span className="text-gray-700 dark:text-slate-300">{outcome.outcome}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Requirements */}
    {course.requirements && course.requirements.length > 0 && (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Requirements</h2>
        <ul className="space-y-2">
          {course.requirements.map((req, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-700 dark:text-slate-300">
              <span className="text-gray-400 dark:text-slate-500">•</span>
              <span>{req.requirement}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Curriculum Tab
const CurriculumTab = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState([]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (!sections || sections.length === 0) {
    return <p className="text-gray-500 dark:text-slate-400">No curriculum available yet.</p>;
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div key={section.id} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition text-left"
          >
            <div className="flex items-center gap-4 flex-1">
              <span className="text-gray-600 dark:text-slate-400">{expandedSections.includes(section.id) ? '▼' : '▶'}</span>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Section {index + 1}: {section.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {section.lessons?.length || 0} lessons
                </p>
              </div>
            </div>
          </button>

          {expandedSections.includes(section.id) && section.lessons && (
            <div className="border-t bg-gray-50 dark:bg-slate-800/50">
              {section.lessons.map((lesson, lessonIndex) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between px-4 py-3 border-b dark:border-slate-700 last:border-b-0 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 dark:text-slate-500 text-sm">{lessonIndex + 1}</span>
                    <div className="flex items-center gap-2">
                      {lesson.contentType === 'VIDEO' && <span>▶️</span>}
                      {lesson.contentType === 'TEXT' && <span>📄</span>}
                      {lesson.contentType === 'QUIZ' && <span>❓</span>}
                      <span className="text-gray-700 dark:text-slate-300">{lesson.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.isPreview && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        Preview
                      </span>
                    )}
                    {lesson.duration && (
                      <span className="text-sm text-gray-600 dark:text-slate-400">{lesson.duration} min</span>
                    )}
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

// Reviews Tab
const ReviewsTab = ({ reviews, courseId }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-slate-400 mb-4">No reviews yet</p>
        <p className="text-sm text-gray-400 dark:text-slate-500">Be the first to review this course!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }) => (
  <div className="border-b dark:border-slate-700 pb-6 last:border-b-0">
    <div className="flex items-start gap-4">
      <img
        src={review.user?.profilePicture || 'https://via.placeholder.com/50'}
        alt={review.user?.firstName}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white">
              {review.user?.firstName} {review.user?.lastName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {review.reviewText && (
          <p className="text-gray-700 dark:text-slate-300 mt-2">{review.reviewText}</p>
        )}
      </div>
    </div>
  </div>
);

// Instructor Info Component
const InstructorInfo = ({ instructor }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mt-6 transition-colors">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">About the Instructor</h2>
    <div className="flex items-start gap-4">
      <img
        src={instructor?.profilePicture || 'https://via.placeholder.com/80'}
        alt={instructor?.firstName}
        className="w-20 h-20 rounded-full object-cover"
      />
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          {instructor?.firstName} {instructor?.lastName}
        </h3>
        {instructor?.bio && (
          <p className="text-gray-600 dark:text-slate-400 mt-2">{instructor.bio}</p>
        )}
      </div>
    </div>
  </div>
);

// Course Features Component
const CourseFeatures = ({ course, totalLessons, totalDuration }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 transition-colors">
    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">This course includes:</h3>
    <div className="space-y-3">
      <FeatureItem icon="⏱" text={`${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m on-demand video`} />
      <FeatureItem icon="📚" text={`${totalLessons} lessons`} />
      <FeatureItem icon="📱" text="Access on mobile and desktop" />
      <FeatureItem icon="♾️" text="Full lifetime access" />
      <FeatureItem icon="🎓" text="Certificate of completion" />
      <FeatureItem icon="💰" text="30-day money-back guarantee" />
    </div>
  </div>
);

// Helper Components
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-600 dark:text-slate-400 flex items-center gap-2">
      <span>{icon}</span>
      {label}
    </span>
    <span className="font-medium text-gray-800 dark:text-white">{value}</span>
  </div>
);

const FeatureItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-gray-700 dark:text-slate-300">
    <span className="text-xl">{icon}</span>
    <span>{text}</span>
  </div>
);

export default CourseDetail;