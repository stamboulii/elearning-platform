/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import courseService from '../../services/courseService';
import sectionService from '../../services/sectionService';
import progressService from '../../services/progressService';
import enrollmentService from '../../services/enrollmentService';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import StudyScheduleView from '../../components/course/StudyScheduleView';
import FlashcardDeckView from '../../components/course/FlashcardDeckView';
import flashcardService from '../../services/flashcardService';
import { BrainCircuit, Calendar } from 'lucide-react';

const CoursePlayer = () => {
  const { t } = useTranslation();
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
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'flashcards'
  const [flashcardDeck, setFlashcardDeck] = useState(null);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    // Fetch progress for all content types (not just VIDEO)
    if (currentLesson && enrollment) {
      fetchLessonProgress();
    }
  }, [currentLesson, enrollment]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      const [courseData, sectionsData] = await Promise.all([
        courseService.getCourse(courseId),
        sectionService.getCourseSections(courseId)
      ]);

      setCourse(courseData);
      setSections(sectionsData);

      if (user) {
        try {
          const enrollmentCheck = await enrollmentService.checkEnrollment(courseId);
          if (enrollmentCheck.isEnrolled) {
            setEnrollment(enrollmentCheck.enrollment);
            console.log('Certificate:', enrollmentCheck.enrollment?.certificate);
          }
        } catch (error) {
          console.error('Error checking enrollment:', error);
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
      toast.error(t('common.error_occurred'));
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
  const fetchFlashcards = async () => {
    if (!currentLesson) return;
    try {
      setFlashcardLoading(true);
      const response = await flashcardService.getDeckByLesson(currentLesson.id);
      if (response.success) {
        setFlashcardDeck(response.data);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setFlashcardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'flashcards' && currentLesson && !flashcardDeck) {
      fetchFlashcards();
    }
  }, [activeTab, currentLesson]);

    // Poll for certificate when course is complete but cert not yet available
  useEffect(() => {
    if (!enrollment || enrollment.progressPercentage !== 100 || enrollment.certificate) return;

    const poll = setInterval(async () => {
      try {
        const enrollmentCheck = await enrollmentService.checkEnrollment(courseId);
        if (enrollmentCheck.isEnrolled && enrollmentCheck.enrollment?.certificate) {
          setEnrollment(enrollmentCheck.enrollment);
          clearInterval(poll);
        }
      } catch (err) {
        console.error('Certificate poll error:', err);
        clearInterval(poll);
      }
    }, 3000); // check every 3 seconds

    // Stop polling after 30 seconds to avoid infinite loop
    const timeout = setTimeout(() => clearInterval(poll), 30000);

    return () => {
      clearInterval(poll);
      clearTimeout(timeout);
    };
  }, [enrollment?.progressPercentage, enrollment?.certificate, courseId]);

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
      navigate(`/courses/${courseId}`);
      return;
    }

    setCurrentLesson(lesson);
    setVideoProgress(0);
    // Don't reset isCompleted here — it causes a flash of "Mark as Complete"
    // on already-completed lessons. fetchLessonProgress() will set the correct value.
    setActiveTab('content');
    setFlashcardDeck(null);

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
      toast.error(t('student.course_player.track_prompt'));
      return;
    }

    try {
      await progressService.markLessonComplete(currentLesson.id);
      setIsCompleted(true);

      // Refresh enrollment data to update progress percentage
      const enrollmentCheck = await enrollmentService.checkEnrollment(courseId);
        if (enrollmentCheck.isEnrolled) {
          setEnrollment(enrollmentCheck.enrollment);
      }

      // GAMIFICATION: Confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#fbbf24', '#10b981']
      });

      // Show XP Gain Toast (resolve translations before the toast call to avoid shadowing `t`)
      const xpEarnedMsg = t('student.course_player.xp_earned');
      const lessonCompletedMsg = t('student.course_player.lesson_completed');
      toast.success(
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <p className="font-bold">{xpEarnedMsg}</p>
            <p className="text-xs text-gray-500">{lessonCompletedMsg}</p>
          </div>
        </div>,
        { duration: 4000 }
      );

      // Refresh user data (XP and Level)
      await refreshUser();

    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error(t('student.course_player.failed_mark'));
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
          <p className="text-slate-600 dark:text-slate-400 mb-4">{t('student.course_player.course_not_found')}</p>
          <Link to="/courses" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('student.course_player.back_to_courses')}
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
                ← {t('student.course_player.back_to_course')}
              </Link>
              <h1 className="text-xl font-bold truncate text-slate-900 dark:text-white">{course.title}</h1>

              {/* Access Status Banner */}
              {!enrollment && !isCourseOwner && !isCourseFullyFree && (
                <div className="mt-2 inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-lg text-sm">
                  <span>👁</span>
                  <span>{t('student.course_player.preview_mode')}</span>
                  <Link to={`/courses/${courseId}`} className="underline font-medium">
                    {t('student.course_player.enroll_now')}
                  </Link>
                </div>
              )}
            </div>
            {enrollment && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {t('student.course_card.progress')}: {overallProgress}%
                  </div>
                  <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          <h2 className="font-bold mb-4 sticky top-0 bg-white dark:bg-slate-900 py-2 border-b dark:border-slate-800 text-slate-800 dark:text-white z-10">{t('student.course_player.course_content')}</h2>

          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-slate-500 dark:text-slate-400 px-2">
                {t('student.course_player.section')} {sectionIndex + 1}: {section.title}
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
                            👁 {t('common.preview')}
                          </span>
                        )}
                        {lesson.isFree && !lesson.isPreview && (
                          <span className="text-[10px] uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                            🎁 {t('instructor.dashboard.analytics.paid_enrollments')}
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
        <div className="lg:col-span-3 space-y-4">

          {/* Certificate Banner — always visible when course is 100% complete */}
          {enrollment && overallProgress === 100 && enrollment.certificate && (
            <div className="p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl shadow-md animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-amber-900 dark:text-amber-300">
                    {t('common.congratulations') || 'Congratulations!'}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                    {t('student.course_player.course_completed_desc') || 'You have completed this course. Your certificate is ready!'}
                  </p>
                </div>
                <Link
                  to={`/student/certificates/${enrollment.certificate.id}`}
                  className="shrink-0 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-amber-100 dark:shadow-none flex items-center gap-2 text-sm"
                >
                  📜 {t('common.certificate') || 'View Certificate'}
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
            {currentLesson ? (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentLesson.title}</h2>
                    <div className="flex items-center gap-4 mt-4 border-b dark:border-slate-800">
                      <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-2 px-1 text-sm font-bold transition-all ${activeTab === 'content'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                          }`}
                      >
                        Lesson Content
                      </button>
                      <button
                        onClick={() => setActiveTab('flashcards')}
                        className={`pb-2 px-1 text-sm font-bold transition-all flex items-center gap-1 ${activeTab === 'flashcards'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                          }`}
                      >
                        <BrainCircuit className="w-4 h-4" />
                        Flashcards
                      </button>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        className={`pb-2 px-1 text-sm font-bold transition-all flex items-center gap-1 ${activeTab === 'schedule'
                          ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                          }`}
                      >
                        <Calendar className="w-4 h-4" />
                        Study Plan
                      </button>
                    </div>
                  </div>
                </div>

                {activeTab === 'flashcards' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {flashcardLoading ? (
                      <div className="py-20 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : (
                      <FlashcardDeckView deck={flashcardDeck} />
                    )}
                  </div>
                ) : activeTab === 'schedule' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <StudyScheduleView enrollmentId={enrollment?.id} />
                  </div>
                ) : (
                  <>
                    {isLessonLocked(currentLesson) ? (
                      <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="mb-4 text-6xl">🔒</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('student.course_player.locked_title')}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">{t('student.course_player.locked_desc')}</p>
                        <Link
                          to={`/courses/${courseId}`}
                          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                          {t('student.course_player.view_enroll')}
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
                            <p className="text-amber-800 dark:text-amber-400 font-medium">{t('student.course_player.quiz_placeholder')}</p>
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
                                <span className="font-black text-sm uppercase tracking-wider">{t('course.status.completed')}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 mt-6">
                            <p className="text-indigo-800 dark:text-indigo-400 font-medium">
                              💡 <strong>{t('student.course_player.enjoy_prompt')}</strong>
                            </p>
                            <Link
                              to={`/courses/${courseId}`}
                              className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition font-bold"
                            >
                              {t('student.course_player.enroll_now')}
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-500 dark:text-slate-400 font-medium italic">{t('student.course_player.select_lesson')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;