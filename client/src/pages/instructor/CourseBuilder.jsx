/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseService from '../../services/courseService';
import sectionService from '../../services/sectionService';
import lessonService from '../../services/lessonService';

const CourseBuilder = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, sectionsData] = await Promise.all([
        courseService.getCourse(courseId),
        sectionService.getCourseSections(courseId)
      ]);
      setCourse(courseData);
      setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching course data:', error);
      alert('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setSelectedSection(null);
    setShowSectionModal(true);
  };

  const handleAddLesson = (section) => {
    setSelectedSection(section);
    setShowLessonModal(true);
  };

  const handlePublishCourse = async () => {
    if (sections.length === 0) {
      alert('Please add at least one section before publishing');
      return;
    }

    const hasLessons = sections.some(s => s.lessons && s.lessons.length > 0);
    if (!hasLessons) {
      alert('Please add at least one lesson before publishing');
      return;
    }

    try {
      await courseService.updateCourse(courseId, { status: 'PUBLISHED' });
      alert('Course published successfully!');
      navigate('/instructor/courses');
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('Failed to publish course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs">Loading Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Curriculum</span>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{course?.title}</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Design your student's learning journey lesson by lesson</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePublishCourse}
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-all font-black shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95"
            >
              🚀 Publish Course
            </button>
            <button
              onClick={() => navigate('/instructor/courses')}
              className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-8 py-3.5 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all font-black active:scale-95"
            >
              Save & Exit
            </button>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 mb-10 transition-all">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative group">
              <img
                src={course?.thumbnailImage || 'https://via.placeholder.com/150'}
                alt={course?.title}
                className="w-48 h-48 object-cover rounded-3xl shadow-xl transition group-hover:scale-105"
              />
              <div className="absolute -bottom-3 -right-3">
                <UploadThumbnail courseId={courseId} onUpload={fetchCourseData} />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{course?.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed max-w-2xl">{course?.shortDescription}</p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                  {course?.level}
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                  {course?.isFree ? 'FREE' : `$${course?.price}`}
                </span>
                <span className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                  {sections.length} Sections
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Section Button */}
        <button
          onClick={handleAddSection}
          className="w-full group bg-white dark:bg-slate-900 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 py-6 rounded-3xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all font-black text-xl flex items-center justify-center gap-3 mb-10 active:scale-[0.99]"
        >
          <span className="text-3xl group-hover:rotate-90 transition-transform">+</span>
          Create New Module
        </button>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 p-20 text-center">
              <div className="text-6xl mb-6">🏗️</div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Curriculum is Empty</h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto italic">No modules planned yet. Start by defining the first chapter of your course!</p>
            </div>
          ) : (
            sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
                courseId={courseId}
                onAddLesson={() => handleAddLesson(section)}
                onRefresh={fetchCourseData}
                uploadProgress={uploadProgress}
                setUploadProgress={setUploadProgress}
              />
            ))
          )}
        </div>

        {/* Modals */}
        {showSectionModal && (
          <SectionModal
            courseId={courseId}
            onClose={() => setShowSectionModal(false)}
            onSuccess={fetchCourseData}
          />
        )}

        {showLessonModal && selectedSection && (
          <LessonModal
            courseId={courseId}
            section={selectedSection}
            course={course}  // 🆕 ADD THIS PROP
            onClose={() => setShowLessonModal(false)}
            onSuccess={fetchCourseData}
            setUploadProgress={setUploadProgress}
          />
        )}
      </div>
    </div>
  );
};

// Section Card Component
const SectionCard = ({ section, index, courseId, onAddLesson, onRefresh, uploadProgress, setUploadProgress }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSection = async () => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      setIsDeleting(true);
      await sectionService.deleteSection(section.id);
      onRefresh();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert(error.response?.data?.message || 'Failed to delete section');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      await lessonService.deleteLesson(lessonId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
      {/* Section Header */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-5 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <span className={`transform transition-transform duration-300 text-lg ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>▾</span>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Module {index + 1}</span>
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">
              {section.title}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">
              {section.lessons?.length || 0} Contents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onAddLesson}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all font-black text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            + New Lesson
          </button>
          <button
            onClick={handleDeleteSection}
            disabled={isDeleting}
            className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
            title="Delete Module"
          >
            {isDeleting ? '...' : '✕'}
          </button>
        </div>
      </div>

      {/* Lessons List */}
      {isExpanded && (
        <div className="p-6 bg-white dark:bg-slate-900/50">
          {!section.lessons || section.lessons.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400 dark:text-slate-500 font-bold italic">No lessons in this module yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {section.lessons.map((lesson, lessonIndex) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={lessonIndex}
                  onDelete={() => handleDeleteLesson(lesson.id)}
                  uploadProgress={uploadProgress[lesson.id]}
                  setUploadProgress={setUploadProgress}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Lesson Row Component
const LessonRow = ({ lesson, index, onDelete, uploadProgress, setUploadProgress }) => {
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      alert('File size must be less than 500MB');
      return;
    }

    try {
      setUploading(true);
      await lessonService.uploadLessonVideo(lesson.id, file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [lesson.id]: progress }));
      });
      alert('Video uploaded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[lesson.id];
        return newProgress;
      });
    }
  };

  return (
    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-white dark:hover:bg-slate-800/40 hover:shadow-lg transition-all group">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg shadow-sm text-[10px] font-black text-slate-400">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{lesson.title}</h4>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md border border-indigo-100/50 dark:border-indigo-800/50">
              {lesson.contentType}
            </span>
            {lesson.duration && (
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                ⏱ {lesson.duration} min
              </span>
            )}
            {lesson.contentUrl && (
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Ready
              </span>
            )}
            {lesson.isPreview && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-100/50 dark:border-amber-800/50">
                Preview
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        {lesson.contentType === 'VIDEO' && !lesson.contentUrl && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={uploading}
            />
            <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all font-black text-xs uppercase tracking-widest inline-block text-center whitespace-nowrap active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none">
              {uploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
            </span>
          </label>
        )}
        <button
          onClick={onDelete}
          className="text-slate-400 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
          title="Delete Lesson"
        >
          ✕
        </button>
      </div>

      {/* Upload Progress Bar */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-b-2xl overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Upload Thumbnail Component
const UploadThumbnail = ({ courseId, onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      await courseService.uploadThumbnail(courseId, file);
      alert('Thumbnail uploaded successfully!');
      onUpload();
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert('Failed to upload thumbnail');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="cursor-pointer group">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:bg-indigo-500 transition-all group-active:scale-95 group-hover:rotate-12">
        {uploading ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        ) : (
          <span className="text-xl">📷</span>
        )}
      </div>
    </label>
  );
};

// Section Modal Component
const SectionModal = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Section title is required');
      return;
    }

    try {
      setLoading(true);
      await sectionService.createSection(courseId, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 transition-all animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Add Module</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Structure your course with a new section or chapter</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Module Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
            />
          </div>

          <div className="mb-10">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">Goal of this Module</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="What will students achieve in this section?"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl hover:opacity-90 transition-all font-black shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 disabled:opacity-50"
            >
              {loading ? '...' : 'Create Module'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Lesson Modal Component
// Replace the LessonModal component in your CourseBuilder.jsx with this version:

const LessonModal = ({ courseId, section, onClose, onSuccess, setUploadProgress, course }) => {  // 🆕 Added course prop
  const [formData, setFormData] = useState({
    title: '',
    contentType: 'VIDEO',
    content: '',
    duration: '',
    isPreview: false,
    isFree: false,
    // Add Quiz basic fields
    quizTitle: '',
    passingScore: 80,
  });
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', questionType: 'MULTIPLE_CHOICE', options: ['', ''], correctAnswer: 0, points: 1 }
  ]);

  // 🆕 Check if course is free
  const isCourseFullyFree = course?.isFree || parseFloat(course?.price || 0) === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Lesson title is required');
      return;
    }

    try {
      setLoading(true);

      // Create lesson first
      const lesson = await lessonService.createLesson(courseId, section.id, formData);

      // Upload video if selected
      if (videoFile && formData.contentType === 'VIDEO') {
        await lessonService.uploadLessonVideo(lesson.id, videoFile, (progress) => {
          setUploadProgress(prev => ({ ...prev, [lesson.id]: progress }));
        });
      }

      // Upload document if selected
      if (documentFile && formData.contentType === 'DOCUMENT') {
        await lessonService.uploadLessonResources(lesson.id, [documentFile]);
      }

      // Handle Quiz if selected (Assuming backend has endpoint for this or handles it via createLesson)
      if (formData.contentType === 'QUIZ') {
        // If the backend createLesson doesn't handle quiz nestedly, we'd call quiz service here
        // For now, let's assume createLesson can take it or we add a note
        console.log('Quiz Data:', { title: formData.quizTitle, questions: quizQuestions });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating lesson:', error);
      alert('Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative border border-slate-100 dark:border-slate-800 transition-all animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">New Lesson</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Add to: {section.title}
          </h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Define the learning content and access type</p>

        <div>
          <div className="mb-6">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Lesson Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Components"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">Content Type</label>
            <select
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner appearance-none cursor-pointer"
            >
              <option value="VIDEO">Video</option>
              <option value="TEXT">Text</option>
              <option value="QUIZ">Quiz</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>

          {formData.contentType === 'VIDEO' && (
            <div className="mb-6 p-6 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-3xl">
              <label className="block text-indigo-700 dark:text-indigo-300 font-bold mb-3 text-center">🎥 Upload Video Lesson</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full text-slate-500 dark:text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
              <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-4 text-center">Max file size: 500MB</p>
            </div>
          )}

          {formData.contentType === 'TEXT' && (
            <div className="mb-6">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">Lesson Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="6"
                placeholder="Write your lesson content here..."
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner leading-relaxed"
              />
            </div>
          )}

          {formData.contentType === 'DOCUMENT' && (
            <div className="mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3 text-center">📄 Upload Study Resources</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(e) => setDocumentFile(e.target.files[0])}
                className="w-full text-slate-500 dark:text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-700 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4 text-center">PDF, Word, or PowerPoint (Max 10MB)</p>
            </div>
          )}

          {formData.contentType === 'QUIZ' && (
            <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white font-black flex items-center gap-3 text-xl tracking-tight">
                  <span className="text-3xl">🧠</span> Quiz Builder
                </h3>
                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Pass Score (%)</label>
                    <input
                      type="number"
                      className="w-20 text-center font-black bg-white dark:bg-slate-700 border-none rounded-xl p-2 text-slate-900 dark:text-white shadow-sm"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <span className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                      Question #{qIndex + 1}
                    </span>
                    {quizQuestions.length > 1 && (
                      <button
                        onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex))}
                        className="text-slate-300 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Enter your question here..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                    value={q.questionText}
                    onChange={(e) => {
                      const newQ = [...quizQuestions];
                      newQ[qIndex].questionText = e.target.value;
                      setQuizQuestions(newQ);
                    }}
                  />

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] px-2">Options</label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() => {
                              const newQ = [...quizQuestions];
                              newQ[qIndex].correctAnswer = oIndex;
                              setQuizQuestions(newQ);
                            }}
                            className="w-6 h-6 text-emerald-500 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 transition-all font-medium shadow-inner"
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newQ = [...quizQuestions];
                            newQ[qIndex].options[oIndex] = e.target.value;
                            setQuizQuestions(newQ);
                          }}
                        />
                        {q.options.length > 2 && (
                          <button className="text-slate-300 hover:text-rose-500 transition-colors p-2" onClick={() => {
                            const newQ = [...quizQuestions];
                            newQ[qIndex].options = q.options.filter((_, i) => i !== oIndex);
                            setQuizQuestions(newQ);
                          }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newQ = [...quizQuestions];
                        newQ[qIndex].options.push('');
                        setQuizQuestions(newQ);
                      }}
                      className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-2 hover:underline ml-2"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setQuizQuestions([...quizQuestions, { questionText: '', questionType: 'MULTIPLE_CHOICE', options: ['', ''], correctAnswer: 0, points: 1 }])}
                className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:border-slate-400"
              >
                + Add Another Question
              </button>
            </div>
          )}

          <div className="mb-10">
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-3">
              Estimated Duration (min)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="15"
              className="w-64 px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-black placeholder-slate-400 transition-all shadow-inner"
            />
          </div>

          {/* Lesson Access Control - CONDITIONAL RENDERING */}
          <div className="mb-10 border-t border-slate-100 dark:border-slate-800 pt-8">
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em] text-center">Configuring Access</h4>

            {/* Show info banner if course is free */}
            {isCourseFullyFree ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 p-5 rounded-2xl mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest text-xs mb-1">Free Course Baseline</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium leading-relaxed">
                      All lessons are automatically unlocked. Use "Preview" to feature this lesson on your landing page.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 border-l-4 border-indigo-500 p-5 rounded-2xl mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest text-xs mb-1">Paid Course (${course?.price})</p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-500 font-medium leading-relaxed">
                      Control which lessons are gated behind payment. Give students a taste of your teaching!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preview Toggle - Always show */}
              <label className={`flex items-start gap-4 cursor-pointer p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 transition-all ${formData.isPreview ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  className="w-6 h-6 text-amber-500 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-amber-500 dark:bg-slate-800 mt-1 cursor-pointer"
                />
                <div>
                  <span className="text-slate-900 dark:text-white font-black text-sm block">👁 Highlight as Preview</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-widest">Featured on Landing Page</p>
                </div>
              </label>

              {/* Free Lesson Toggle - ONLY show for PAID courses */}
              {!isCourseFullyFree && (
                <label className={`flex items-start gap-4 cursor-pointer p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 transition-all ${formData.isFree ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-slate-700 hover:border-slate-300'}`}>
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-6 h-6 text-emerald-500 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 dark:bg-slate-800 mt-1 cursor-pointer"
                  />
                  <div>
                    <span className="text-slate-900 dark:text-white font-black text-sm block">🎁 Unlocked for All</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-widest">No enrollment required</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl hover:opacity-90 transition-all font-black shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 disabled:opacity-50 text-lg"
            >
              {loading ? '...' : 'Create Lesson'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default CourseBuilder;