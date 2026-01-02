import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import sectionService from '../../services/sectionService';
import { useAuth } from '../../hooks/useAuth';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, sectionsData, enrollmentCheck] = await Promise.all([
        courseService.getCourse(id),
        courseService.getCourse(id).then(c => {
          // If course has sections, fetch them
          return sectionService.getCourseSections(id).catch(() => []);
        }).catch(() => []),
        user ? enrollmentService.checkEnrollment(id).catch(() => ({ isEnrolled: false })) : Promise.resolve({ isEnrolled: false })
      ]);

      setCourse(courseData);
      setSections(sectionsData);
      setIsEnrolled(enrollmentCheck.isEnrolled || false);
    } catch (error) {
      console.error('Error fetching course data:', error);
      alert('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEnrolling(true);
      await enrollmentService.enrollInCourse(id);
      setIsEnrolled(true);
      alert('Successfully enrolled in course!');
      navigate(`/student/courses/${id}/learn`);
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h1>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: course.currency || 'USD'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl mb-6 text-blue-100">{course.shortDescription}</p>
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {course.level}
                </span>
                {course.estimatedDuration && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    ⏱️ {course.estimatedDuration} hours
                  </span>
                )}
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {course.language}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={course.thumbnailImage || 'https://via.placeholder.com/600x400'}
                alt={course.title}
                className="rounded-lg shadow-2xl max-w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {course.fullDescription || course.shortDescription}
                </p>
              </div>
            </div>

            {/* Course Content */}
            {sections.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Content</h2>
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Section {index + 1}: {section.title}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      )}
                      {section.lessons && section.lessons.length > 0 && (
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {section.lessons.map((lesson) => (
                            <li key={lesson.id}>{lesson.title}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {course.requirements.map((req, index) => (
                    <li key={index}>{req.requirement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outcomes */}
            {course.outcomes && course.outcomes.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">What You'll Learn</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {course.outcomes.map((outcome, index) => (
                    <li key={index}>{outcome.outcome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {course.discountPrice ? formatPrice(course.discountPrice) : formatPrice(course.price)}
                </div>
                {course.discountPrice && (
                  <div className="text-lg text-gray-500 line-through">
                    {formatPrice(course.price)}
                  </div>
                )}
              </div>

              {isEnrolled ? (
                <Link
                  to={`/student/courses/${id}/learn`}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition text-center block font-medium"
                >
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || course.status !== 'PUBLISHED'}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              {course.status !== 'PUBLISHED' && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  This course is not available for enrollment
                </p>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium capitalize">{course.level}</span>
                </div>
                {course.estimatedDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.estimatedDuration} hours</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{course.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

