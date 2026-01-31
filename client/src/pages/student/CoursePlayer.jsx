// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import courseService from '../../services/courseService';
// import sectionService from '../../services/sectionService';
// import progressService from '../../services/progressService';
// import enrollmentService from '../../services/enrollmentService';
// import { useAuth } from '../../hooks/useAuth';

// const CoursePlayer = () => {
//   const { courseId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [course, setCourse] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [currentLesson, setCurrentLesson] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [videoProgress, setVideoProgress] = useState(0);
//   const [isCompleted, setIsCompleted] = useState(false);

//   useEffect(() => {
//     fetchCourseData();
//   }, [courseId]);

//   useEffect(() => {
//     if (currentLesson && currentLesson.contentType === 'VIDEO') {
//       fetchLessonProgress();
//     }
//   }, [currentLesson]);

//   const fetchCourseData = async () => {
//     try {
//       setLoading(true);

//       const enrollmentCheck = await enrollmentService.checkEnrollment(courseId);
//       if (!enrollmentCheck.isEnrolled) {
//         navigate(`/courses/${courseId}`);
//         return;
//       }

//       const [courseData, sectionsData, enrollmentsData] = await Promise.all([
//         courseService.getCourse(courseId),
//         sectionService.getCourseSections(courseId),
//         enrollmentService.getMyEnrollments()
//       ]);

//       setCourse(courseData);
//       setSections(sectionsData);

//       const userEnrollment =
//         enrollmentsData.data?.enrollments?.find(e => e.courseId === courseId) ||
//         enrollmentsData.find(e => e.course?.id === courseId);

//       setEnrollment(userEnrollment);

//       if (sectionsData.length > 0 && sectionsData[0].lessons?.length > 0) {
//         setCurrentLesson(sectionsData[0].lessons[0]);
//       }
//     } catch (error) {
//       console.error('Error fetching course data:', error);
//       alert('Failed to load course');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchLessonProgress = async () => {
//     if (!currentLesson) return;

//     try {
//       const progress = await progressService.getLessonProgress(currentLesson.id);
//       setVideoProgress(progress?.lastPosition || 0);
//       setIsCompleted(progress?.isCompleted || false);
//     } catch (error) {
//       console.error('Error fetching lesson progress:', error);
//     }
//   };

//   /* =========================
//      ACCESS CONTROL (ADDED)
//   ========================== */
//   const isLessonLocked = (lesson) => {
//     // Instructor can access everything
//     if (course?.instructorId === user?.id) return false;

//     // Preview lessons are public
//     if (lesson.isPreview) return false;

//     // Not enrolled => locked
//     if (!enrollment) return true;

//     return false;
//   };

//   const handleLessonClick = async (lesson) => {
//     if (isLessonLocked(lesson)) {
//       alert('This lesson is locked. Please enroll to access it.');
//       navigate(`/courses/${courseId}`);
//       return;
//     }

//     setCurrentLesson(lesson);
//     setVideoProgress(0);
//     setIsCompleted(false);

//     try {
//       const progress = await progressService.getLessonProgress(lesson.id);
//       setVideoProgress(progress?.lastPosition || 0);
//       setIsCompleted(progress?.isCompleted || false);
//     } catch (error) {
//       console.error('Error fetching lesson progress:', error);
//     }
//   };

//   const handleVideoProgress = async (position) => {
//     if (!currentLesson || currentLesson.contentType !== 'VIDEO') return;

//     setVideoProgress(position);

//     try {
//       await progressService.updateVideoProgress(currentLesson.id, {
//         lastPosition: position,
//         timeSpent: position
//       });
//     } catch (error) {
//       console.error('Error updating video progress:', error);
//     }
//   };

//   const handleCompleteLesson = async () => {
//     if (!currentLesson) return;

//     try {
//       await progressService.markLessonComplete(currentLesson.id);
//       setIsCompleted(true);

//       const enrollmentsData = await enrollmentService.getMyEnrollments();
//       const userEnrollment =
//         enrollmentsData.data?.enrollments?.find(e => e.courseId === courseId) ||
//         enrollmentsData.find(e => e.course?.id === courseId);

//       setEnrollment(userEnrollment);
//     } catch (error) {
//       console.error('Error completing lesson:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (!course || !enrollment) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Link to="/student/courses" className="text-blue-600">
//           Back to My Courses
//         </Link>
//       </div>
//     );
//   }

//   const overallProgress = enrollment.progressPercentage || 0;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* HEADER */}
//       <div className="bg-white shadow-sm border-b sticky top-0 z-10">
//         <div className="container mx-auto px-4 py-4 flex justify-between">
//           <div>
//             <Link to={`/courses/${courseId}`} className="text-blue-600">
//               ← Back to Course
//             </Link>
//             <h1 className="text-xl font-bold mt-1">{course.title}</h1>
//           </div>
//           <div>
//             <div className="text-sm text-gray-600">Progress: {overallProgress}%</div>
//             <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
//               <div
//                 className="bg-blue-600 h-2 rounded-full"
//                 style={{ width: `${overallProgress}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
//         {/* SIDEBAR */}
//         <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
//           <h2 className="font-bold mb-4">Course Content</h2>

//           {sections.map((section, sectionIndex) => (
//             <div key={section.id} className="mb-4">
//               <h3 className="text-sm font-semibold mb-2">
//                 Section {sectionIndex + 1}: {section.title}
//               </h3>

//               <div className="space-y-1">
//                 {section.lessons.map((lesson) => {
//                   const locked = isLessonLocked(lesson);
//                   const current = currentLesson?.id === lesson.id;

//                   return (
//                     <button
//                       key={lesson.id}
//                       onClick={() => handleLessonClick(lesson)}
//                       disabled={locked}
//                       className={`w-full text-left p-3 rounded transition ${
//                         current
//                           ? 'bg-blue-100 border-l-4 border-blue-600'
//                           : locked
//                           ? 'opacity-50 cursor-not-allowed'
//                           : 'hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className="flex items-center gap-2">
//                         {locked ? (
//                           <span className="text-gray-400">🔒</span>
//                         ) : (
//                           <span className="text-green-600">○</span>
//                         )}
//                         <span className="flex-1 text-sm">{lesson.title}</span>

//                         {lesson.isPreview && (
//                           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
//                             Preview
//                           </span>
//                         )}
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* PLAYER */}
//         <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-2xl font-bold mb-4">{currentLesson.title}</h2>

//           {currentLesson.contentType === 'VIDEO' && (
//             <video
//               src={currentLesson.contentUrl}
//               controls
//               className="w-full rounded"
//               onTimeUpdate={(e) =>
//                 handleVideoProgress(Math.floor(e.target.currentTime))
//               }
//               onLoadedMetadata={(e) => {
//                 if (videoProgress > 0) {
//                   e.target.currentTime = videoProgress;
//                 }
//               }}
//             />
//           )}

//           {currentLesson.contentType === 'TEXT' && (
//             <div className="prose max-w-none whitespace-pre-line">
//               {currentLesson.content}
//             </div>
//           )}

//           {!isCompleted && (
//             <button
//               onClick={handleCompleteLesson}
//               className="mt-4 bg-green-600 text-white px-6 py-2 rounded"
//             >
//               Mark as Complete
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CoursePlayer;
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import sectionService from '../../services/sectionService';
import progressService from '../../services/progressService';
import enrollmentService from '../../services/enrollmentService';
import { useAuth } from '../../hooks/useAuth';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

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

      // Fetch course and sections first
      const [courseData, sectionsData] = await Promise.all([
        courseService.getCourse(courseId),
        sectionService.getCourseSections(courseId)
      ]);

      setCourse(courseData);
      setSections(sectionsData);

      // Check enrollment status (but don't block)
      if (user) {
        try {
          const enrollmentCheck = await enrollmentService.checkEnrollment(courseId);

          if (enrollmentCheck.isEnrolled) {
            const enrollmentsData = await enrollmentService.getMyEnrollments();
            const userEnrollment =
              enrollmentsData.data?.enrollments?.find(e => e.courseId === courseId) ||
              enrollmentsData.find(e => e.course?.id === courseId);
            setEnrollment(userEnrollment);
          }
        } catch (error) {
          console.log('Not enrolled');
        }
      }

      // Set first accessible lesson
      if (sectionsData.length > 0) {
        // Find first free/preview lesson or first lesson if enrolled
        let firstAccessibleLesson = null;

        for (const section of sectionsData) {
          if (section.lessons && section.lessons.length > 0) {
            firstAccessibleLesson = section.lessons.find(lesson =>
              lesson.isPreview || lesson.isFree ||
              courseData.instructorId === user?.id ||
              courseData.isFree ||
              parseFloat(courseData.price) === 0
            );

            if (firstAccessibleLesson) break;
          }
        }

        // If no free lesson found, show first lesson anyway (will be locked)
        if (!firstAccessibleLesson && sectionsData[0].lessons?.length > 0) {
          firstAccessibleLesson = sectionsData[0].lessons[0];
        }

        setCurrentLesson(firstAccessibleLesson);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonProgress = async () => {
    if (!currentLesson || !enrollment) return;

    try {
      const progress = await progressService.getLessonProgress(currentLesson.id);
      setVideoProgress(progress?.lastPosition || 0);
      setIsCompleted(progress?.isCompleted || false);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  /* =========================
     FIXED ACCESS CONTROL
  ========================== */
  const isLessonLocked = (lesson) => {
    // 1. Instructor can access everything
    if (course?.instructorId === user?.id) return false;

    // 2. Preview lessons are always accessible
    if (lesson.isPreview) return false;

    // 3. If course is completely free, all lessons are accessible
    if (course?.isFree || parseFloat(course?.price || 0) === 0) return false;

    // 4. If lesson has isFree flag set to true (individual free lesson in paid course)
    if (lesson.isFree) return false;

    // 5. If enrolled, all lessons accessible
    if (enrollment) return false;

    // 6. Otherwise, locked
    return true;
  };

  const handleLessonClick = async (lesson) => {
    const locked = isLessonLocked(lesson);

    if (locked) {
      // Show modal with enrollment prompt
      const confirmEnroll = window.confirm(
        `This lesson is locked. You need to enroll in the course to access it.\n\n` +
        `Would you like to view the course details and enroll?`
      );

      if (confirmEnroll) {
        navigate(`/courses/${courseId}`);
      }
      return;
    }

    setCurrentLesson(lesson);
    setVideoProgress(0);
    setIsCompleted(false);

    // Only try to fetch progress if enrolled
    if (enrollment) {
      try {
        const progress = await progressService.getLessonProgress(lesson.id);
        setVideoProgress(progress?.lastPosition || 0);
        setIsCompleted(progress?.isCompleted || false);
      } catch (error) {
        console.error('Error fetching lesson progress:', error);
      }
    }
  };

  const handleVideoProgress = async (position) => {
    if (!currentLesson || currentLesson.contentType !== 'VIDEO' || !enrollment) return;

    setVideoProgress(position);

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
    if (!currentLesson || !enrollment) {
      alert('You need to enroll in the course to track progress');
      return;
    }

    try {
      await progressService.markLessonComplete(currentLesson.id);
      setIsCompleted(true);

      const enrollmentsData = await enrollmentService.getMyEnrollments();
      const userEnrollment =
        enrollmentsData.data?.enrollments?.find(e => e.courseId === courseId) ||
        enrollmentsData.find(e => e.course?.id === courseId);

      setEnrollment(userEnrollment);

      // GAMIFICATION: Confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#fbbf24', '#10b981']
      });

      // Show XP Gain Toast
      toast.success((t) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="font-bold">+50 XP Earned!</p>
            <p className="text-xs text-gray-500">Lesson completed successfully</p>
          </div>
        </div>
      ), { duration: 4000 });

      // Refresh user data (XP and Level)
      await refreshUser();

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

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Link to="/courses" className="text-blue-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const overallProgress = enrollment?.progressPercentage || 0;
  const isCourseOwner = course?.instructorId === user?.id;
  const isCourseFullyFree = course?.isFree || parseFloat(course?.price || 0) === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline inline-block mb-1">
                ← Back to Course
              </Link>
              <h1 className="text-xl font-bold truncate">{course.title}</h1>

              {/* Access Status Banner */}
              {!enrollment && !isCourseOwner && !isCourseFullyFree && (
                <div className="mt-2 inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-1 rounded-lg text-sm">
                  <span>👁</span>
                  <span>Preview mode - Only free lessons accessible</span>
                  <Link to={`/courses/${courseId}`} className="underline font-medium">
                    Enroll now
                  </Link>
                </div>
              )}
            </div>

            {enrollment && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress: {overallProgress}%</div>
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                {overallProgress === 100 && enrollment.certificate && (
                  <Link
                    to={`/student/certificates/${enrollment.certificate.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-bold text-sm shadow-lg shadow-green-100 flex items-center gap-2"
                  >
                    📜 Certificate
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <h2 className="font-bold mb-4 sticky top-0 bg-white py-2 border-b">Course Content</h2>

          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700 px-2">
                Section {sectionIndex + 1}: {section.title}
              </h3>

              <div className="space-y-1">
                {section.lessons && section.lessons.map((lesson) => {
                  const locked = isLessonLocked(lesson);
                  const current = currentLesson?.id === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className={`w-full text-left p-3 rounded transition ${current
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        : locked
                          ? 'bg-gray-50 opacity-60 hover:opacity-80'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {locked ? (
                          <span className="text-gray-400 text-lg">🔒</span>
                        ) : lesson.isPreview ? (
                          <span className="text-blue-600 text-lg">👁</span>
                        ) : lesson.isFree ? (
                          <span className="text-green-600 text-lg">🎁</span>
                        ) : (
                          <span className="text-green-600 text-lg">▶</span>
                        )}
                        <span className={`flex-1 text-sm ${locked ? 'text-gray-500' : 'text-gray-800'}`}>
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 ml-6">
                        {lesson.isPreview && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            👁 Preview
                          </span>
                        )}
                        {lesson.isFree && !lesson.isPreview && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            🎁 Free
                          </span>
                        )}
                        {lesson.duration && (
                          <span className="text-xs text-gray-500">
                            {lesson.duration} min
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PLAYER */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
          {currentLesson ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {currentLesson.isPreview && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        👁 Preview Lesson
                      </span>
                    )}
                    {currentLesson.isFree && !currentLesson.isPreview && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        🎁 Free Lesson
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isLessonLocked(currentLesson) ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="mb-4 text-6xl">🔒</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">This lesson is locked</h3>
                  <p className="text-gray-600 mb-6">Enroll in the course to access this content</p>
                  <Link
                    to={`/courses/${courseId}`}
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    View Course & Enroll
                  </Link>
                </div>
              ) : (
                <>
                  {currentLesson.contentType === 'VIDEO' && (
                    <div className="mb-6">
                      <video
                        key={currentLesson.id}
                        src={currentLesson.contentUrl}
                        controls
                        className="w-full rounded-lg shadow-lg"
                        onTimeUpdate={(e) =>
                          handleVideoProgress(Math.floor(e.target.currentTime))
                        }
                        onLoadedMetadata={(e) => {
                          if (videoProgress > 0 && enrollment) {
                            e.target.currentTime = videoProgress;
                          }
                        }}
                      />
                    </div>
                  )}

                  {currentLesson.contentType === 'TEXT' && (
                    <div className="prose max-w-none mb-6 whitespace-pre-line">
                      {currentLesson.content}
                    </div>
                  )}

                  {currentLesson.contentType === 'QUIZ' && (
                    <div className="p-6 bg-yellow-50 rounded-lg mb-6">
                      <p className="text-gray-700">Quiz content will be displayed here</p>
                    </div>
                  )}

                  {enrollment ? (
                    <>
                      {!isCompleted ? (
                        <button
                          onClick={handleCompleteLesson}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                        >
                          ✓ Mark as Complete
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                          <span>✓</span>
                          <span className="font-medium">Completed</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-blue-800">
                        💡 <strong>Enjoying this lesson?</strong> Enroll in the course to track your progress and access all lessons!
                      </p>
                      <Link
                        to={`/courses/${courseId}`}
                        className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Select a lesson to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;