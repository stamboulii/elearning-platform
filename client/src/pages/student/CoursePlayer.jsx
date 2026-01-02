import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import sectionService from '../../services/sectionService';
import lessonService from '../../services/lessonService';
import progressService from '../../services/progressService';
import enrollmentService from '../../services/enrollmentService';
import { useAuth } from '../../hooks/useAuth';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (currentLesson && currentLesson.contentType === 'VIDEO') {
      fetchLessonProgress();
    }
  }, [currentLesson]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Check enrollment
      const enrollmentCheck = await enrollmentService.checkEnrollment(courseId);
      if (!enrollmentCheck.isEnrolled) {
        alert('You are not enrolled in this course');
        navigate(`/courses/${courseId}`);
        return;
      }

      // Fetch course data
      const [courseData, sectionsData, enrollmentsData] = await Promise.all([
        courseService.getCourse(courseId),
        sectionService.getCourseSections(courseId),
        enrollmentService.getMyEnrollments()
      ]);

      setCourse(courseData);
      setSections(sectionsData);
      
      // Find enrollment
      const userEnrollment = enrollmentsData.data?.enrollments?.find(
        e => e.courseId === courseId
      ) || enrollmentsData.find(e => e.course?.id === courseId);
      setEnrollment(userEnrollment);

      // Set first lesson as current if no lesson selected
      if (sectionsData.length > 0 && sectionsData[0].lessons?.length > 0) {
        setCurrentLesson(sectionsData[0].lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonProgress = async () => {
    if (!currentLesson) return;
    
    try {
      const progress = await progressService.getLessonProgress(currentLesson.id);
      setVideoProgress(progress?.lastPosition || 0);
      setIsCompleted(progress?.isCompleted || false);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  const handleLessonClick = async (lesson) => {
    setCurrentLesson(lesson);
    setVideoProgress(0);
    setIsCompleted(false);
    
    // Fetch progress for the new lesson
    try {
      const progress = await progressService.getLessonProgress(lesson.id);
      setVideoProgress(progress?.lastPosition || 0);
      setIsCompleted(progress?.isCompleted || false);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  const handleVideoProgress = async (position) => {
    if (!currentLesson || currentLesson.contentType !== 'VIDEO') return;
    
    setVideoProgress(position);
    
    // Update progress on server (debounced)
    try {
      await progressService.updateVideoProgress(currentLesson.id, {
        lastPosition: position,
        timeSpent: position
      });
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;
    
    try {
      await progressService.markLessonComplete(currentLesson.id);
      setIsCompleted(true);
      alert('Lesson marked as complete!');
      
      // Refresh enrollment to update progress
      const enrollmentsData = await enrollmentService.getMyEnrollments();
      const userEnrollment = enrollmentsData.data?.enrollments?.find(
        e => e.courseId === courseId
      ) || enrollmentsData.find(e => e.course?.id === courseId);
      setEnrollment(userEnrollment);
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Failed to mark lesson as complete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course not found</h1>
          <Link to="/student/courses" className="text-blue-600 hover:text-blue-700">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  const overallProgress = enrollment.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/courses/${courseId}`} className="text-blue-600 hover:text-blue-700">
                ← Back to Course
              </Link>
              <h1 className="text-xl font-bold text-gray-800 mt-1">{course.title}</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress: {overallProgress}%</div>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="font-bold text-gray-800 mb-4">Course Content</h2>
              <div className="space-y-2">
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="mb-4">
                    <h3 className="font-semibold text-gray-700 text-sm mb-2">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    {section.lessons && section.lessons.length > 0 && (
                      <ul className="space-y-1">
                        {section.lessons.map((lesson, lessonIndex) => {
                          const isActive = currentLesson?.id === lesson.id;
                          return (
                            <li key={lesson.id}>
                              <button
                                onClick={() => handleLessonClick(lesson)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                <span className="mr-2">
                                  {lessonIndex + 1}. {lesson.title}
                                </span>
                                {lesson.isPreview && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                                    Preview
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Lesson Player */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {currentLesson.title}
                </h2>

                {/* Video Player */}
                {currentLesson.contentType === 'VIDEO' && currentLesson.contentUrl && (
                  <div className="mb-6">
                    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
                      <video
                        src={currentLesson.contentUrl}
                        controls
                        className="absolute top-0 left-0 w-full h-full"
                        onTimeUpdate={(e) => {
                          const position = Math.floor(e.target.currentTime);
                          handleVideoProgress(position);
                        }}
                        onLoadedMetadata={(e) => {
                          if (videoProgress > 0) {
                            e.target.currentTime = videoProgress;
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Text Content */}
                {currentLesson.contentType === 'TEXT' && currentLesson.content && (
                  <div className="mb-6 prose max-w-none">
                    <div className="whitespace-pre-line text-gray-700">
                      {currentLesson.content}
                    </div>
                  </div>
                )}

                {/* Lesson Info */}
                <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
                  {currentLesson.duration && (
                    <span>⏱️ {currentLesson.duration} minutes</span>
                  )}
                  <span className="capitalize">{currentLesson.contentType}</span>
                </div>

                {/* Complete Button */}
                {!isCompleted && (
                  <button
                    onClick={handleCompleteLesson}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Mark as Complete
                  </button>
                )}

                {isCompleted && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg inline-block">
                    ✅ Lesson Completed
                  </div>
                )}

                {/* Resources */}
                {currentLesson.resources && Object.keys(currentLesson.resources).length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Resources</h3>
                    <ul className="space-y-2">
                      {Object.entries(currentLesson.resources).map(([key, url]) => (
                        <li key={key}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            📎 {key}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">Select a lesson to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;

