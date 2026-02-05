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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Course not found</p>
          <Link to="/courses" className="text-indigo-600 dark:text-indigo-400 hover:underline">
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <Link to={`/courses/${courseId}`} className="text-indigo-600 dark:text-indigo-400 hover:underline inline-block mb-1">
                ← Back to Course
              </Link>
              <h1 className="text-xl font-bold truncate text-slate-900 dark:text-white">{course.title}</h1>

              {/* Access Status Banner */}
              {!enrollment && !isCourseOwner && !isCourseFullyFree && (
                <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-lg text-sm">
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
                  <div className="text-sm text-slate-500 dark:text-slate-400">Progress: {overallProgress}%</div>
                  <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                {overallProgress === 100 && enrollment.certificate && (
                  <Link
                    to={`/student/certificates/${enrollment.certificate.id}`}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition font-bold text-sm shadow-lg shadow-emerald-100 dark:shadow-none flex items-center gap-2"
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
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          <h2 className="font-bold mb-4 sticky top-0 bg-white dark:bg-slate-900 py-2 border-b dark:border-slate-800 text-slate-800 dark:text-white z-10">Course Content</h2>

          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400 px-2">
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
                      className={`w-full text-left p-3 rounded-xl transition ${current
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 dark:border-indigo-400'
                        : locked
                          ? 'bg-slate-50 dark:bg-slate-800/50 opacity-60 hover:opacity-80'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {locked ? (
                          <span className="text-slate-400 dark:text-slate-600 text-lg">🔒</span>
                        ) : lesson.isPreview ? (
                          <span className="text-indigo-600 dark:text-indigo-400 text-lg">👁</span>
                        ) : lesson.isFree ? (
                          <span className="text-emerald-500 dark:text-emerald-400 text-lg">🎁</span>
                        ) : (
                          <span className="text-emerald-500 dark:text-emerald-400 text-lg">▶</span>
                        )}
                        <span className={`flex-1 text-sm ${locked ? 'text-slate-500 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                          {lesson.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 ml-6">
                        {lesson.isPreview && (
                          <span className="text-[10px] uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                            👁 Preview
                          </span>
                        )}
                        {lesson.isFree && !lesson.isPreview && (
                          <span className="text-[10px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            🎁 Free
                          </span>
                        )}
                        {lesson.duration && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
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
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
          {currentLesson ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentLesson.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    {currentLesson.isPreview && (
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                        👁 Preview Lesson
                      </span>
                    )}
                    {currentLesson.isFree && !currentLesson.isPreview && (
                      <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                        🎁 Free Lesson
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isLessonLocked(currentLesson) ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <div className="mb-4 text-6xl">🔒</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">This lesson is locked</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Enroll in the course to access this content</p>
                  <Link
                    to={`/courses/${courseId}`}
                    className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none"
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
                    <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-line text-slate-700 dark:text-slate-300">
                      {currentLesson.content}
                    </div>
                  )}

                  {currentLesson.contentType === 'QUIZ' && (
                    <div className="p-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl mb-6">
                      <p className="text-amber-800 dark:text-amber-400 font-medium">Quiz content will be displayed here</p>
                    </div>
                  )}

                  {enrollment ? (
                    <>
                      {!isCompleted ? (
                        <button
                          onClick={handleCompleteLesson}
                          className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-100 dark:shadow-none"
                        >
                          ✓ Mark as Complete
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 px-6 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                          <span className="font-bold">✓</span>
                          <span className="font-black text-sm uppercase tracking-wider">Completed</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mt-6">
                      <p className="text-indigo-800 dark:text-indigo-400 font-medium">
                        💡 <strong>Enjoying this lesson?</strong> Enroll in the course to track your progress and access all lessons!
                      </p>
                      <Link
                        to={`/courses/${courseId}`}
                        className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition font-bold"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 dark:text-slate-400 font-medium italic">Select a lesson to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;