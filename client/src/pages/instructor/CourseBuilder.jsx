// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import courseService from '../../services/courseService';
// import sectionService from '../../services/sectionService';
// import lessonService from '../../services/lessonService';

// const CourseBuilder = () => {
//   const { courseId } = useParams();
//   const navigate = useNavigate();
//   const [course, setCourse] = useState(null);
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showSectionModal, setShowSectionModal] = useState(false);
//   const [showLessonModal, setShowLessonModal] = useState(false);
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState({});

//   useEffect(() => {
//     fetchCourseData();
//   }, [courseId]);

//   const fetchCourseData = async () => {
//     try {
//       setLoading(true);
//       const [courseData, sectionsData] = await Promise.all([
//         courseService.getCourse(courseId),
//         sectionService.getCourseSections(courseId)
//       ]);
//       setCourse(courseData);
//       setSections(sectionsData);
//     } catch (error) {
//       console.error('Error fetching course data:', error);
//       alert('Failed to load course data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddSection = () => {
//     setSelectedSection(null);
//     setShowSectionModal(true);
//   };

//   const handleAddLesson = (section) => {
//     setSelectedSection(section);
//     setShowLessonModal(true);
//   };

//   const handlePublishCourse = async () => {
//     if (sections.length === 0) {
//       alert('Please add at least one section before publishing');
//       return;
//     }

//     const hasLessons = sections.some(s => s.lessons && s.lessons.length > 0);
//     if (!hasLessons) {
//       alert('Please add at least one lesson before publishing');
//       return;
//     }

//     try {
//       await courseService.updateCourse(courseId, { status: 'PUBLISHED' });
//       alert('Course published successfully!');
//       navigate('/instructor/courses');
//     } catch (error) {
//       console.error('Error publishing course:', error);
//       alert('Failed to publish course');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-6xl">
//         {/* Header */}
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">{course?.title}</h1>
//             <p className="text-gray-600">Build your course curriculum</p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={handlePublishCourse}
//               className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
//             >
//               Publish Course
//             </button>
//             <button
//               onClick={() => navigate('/instructor/courses')}
//               className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-medium"
//             >
//               Save & Exit
//             </button>
//           </div>
//         </div>

//         {/* Course Info Card */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center gap-4">
//             <img
//               src={course?.thumbnailImage || 'https://via.placeholder.com/150'}
//               alt={course?.title}
//               className="w-32 h-32 object-cover rounded-lg"
//             />
//             <div className="flex-1">
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">{course?.title}</h3>
//               <p className="text-gray-600 mb-3">{course?.shortDescription}</p>
//               <div className="flex gap-4 text-sm">
//                 <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
//                   {course?.level}
//                 </span>
//                 <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
//                   ${course?.price}
//                 </span>
//                 <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
//                   {sections.length} Sections
//                 </span>
//               </div>
//             </div>
//             <UploadThumbnail courseId={courseId} onUpload={fetchCourseData} />
//           </div>
//         </div>

//         {/* Add Section Button */}
//         <button
//           onClick={handleAddSection}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium mb-6"
//         >
//           + Add Section
//         </button>

//         {/* Sections List */}
//         <div className="space-y-4">
//           {sections.length === 0 ? (
//             <div className="bg-white rounded-lg shadow-md p-12 text-center">
//               <p className="text-gray-500 mb-4">No sections yet. Add your first section to start building your course!</p>
//             </div>
//           ) : (
//             sections.map((section, index) => (
//               <SectionCard
//                 key={section.id}
//                 section={section}
//                 index={index}
//                 courseId={courseId}
//                 onAddLesson={() => handleAddLesson(section)}
//                 onRefresh={fetchCourseData}
//                 uploadProgress={uploadProgress}
//                 setUploadProgress={setUploadProgress}
//               />
//             ))
//           )}
//         </div>

//         {/* Modals */}
//         {showSectionModal && (
//           <SectionModal
//             courseId={courseId}
//             onClose={() => setShowSectionModal(false)}
//             onSuccess={fetchCourseData}
//           />
//         )}

//         {showLessonModal && selectedSection && (
//           <LessonModal
//             courseId={courseId}
//             section={selectedSection}
//             course={course}  // 🆕 ADD THIS PROP
//             onClose={() => setShowLessonModal(false)}
//             onSuccess={fetchCourseData}
//             setUploadProgress={setUploadProgress}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// // Section Card Component
// const SectionCard = ({ section, index, courseId, onAddLesson, onRefresh, uploadProgress, setUploadProgress }) => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDeleteSection = async () => {
//     if (!confirm('Are you sure you want to delete this section?')) return;

//     try {
//       setIsDeleting(true);
//       await sectionService.deleteSection(section.id);
//       onRefresh();
//     } catch (error) {
//       console.error('Error deleting section:', error);
//       alert(error.response?.data?.message || 'Failed to delete section');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleDeleteLesson = async (lessonId) => {
//     if (!confirm('Are you sure you want to delete this lesson?')) return;

//     try {
//       await lessonService.deleteLesson(lessonId);
//       onRefresh();
//     } catch (error) {
//       console.error('Error deleting lesson:', error);
//       alert('Failed to delete lesson');
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       {/* Section Header */}
//       <div className="bg-gray-50 p-4 flex items-center justify-between border-b">
//         <div className="flex items-center gap-4 flex-1">
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="text-gray-600 hover:text-gray-800"
//           >
//             {isExpanded ? '▼' : '▶'}
//           </button>
//           <div>
//             <h3 className="font-semibold text-gray-800">
//               Section {index + 1}: {section.title}
//             </h3>
//             <p className="text-sm text-gray-600">
//               {section.lessons?.length || 0} lessons
//             </p>
//           </div>
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={onAddLesson}
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
//           >
//             + Add Lesson
//           </button>
//           <button
//             onClick={handleDeleteSection}
//             disabled={isDeleting}
//             className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm disabled:opacity-50"
//           >
//             {isDeleting ? 'Deleting...' : 'Delete'}
//           </button>
//         </div>
//       </div>

//       {/* Lessons List */}
//       {isExpanded && (
//         <div className="p-4">
//           {!section.lessons || section.lessons.length === 0 ? (
//             <p className="text-gray-500 text-center py-8">No lessons yet. Click "Add Lesson" to get started.</p>
//           ) : (
//             <div className="space-y-2">
//               {section.lessons.map((lesson, lessonIndex) => (
//                 <LessonRow
//                   key={lesson.id}
//                   lesson={lesson}
//                   index={lessonIndex}
//                   onDelete={() => handleDeleteLesson(lesson.id)}
//                   uploadProgress={uploadProgress[lesson.id]}
//                   setUploadProgress={setUploadProgress}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Lesson Row Component
// const LessonRow = ({ lesson, index, onDelete, uploadProgress, setUploadProgress }) => {
//   const [uploading, setUploading] = useState(false);

//   const handleVideoUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate file size (max 500MB)
//     if (file.size > 500 * 1024 * 1024) {
//       alert('File size must be less than 500MB');
//       return;
//     }

//     try {
//       setUploading(true);
//       await lessonService.uploadLessonVideo(lesson.id, file, (progress) => {
//         setUploadProgress(prev => ({ ...prev, [lesson.id]: progress }));
//       });
//       alert('Video uploaded successfully!');
//       window.location.reload();
//     } catch (error) {
//       console.error('Error uploading video:', error);
//       alert('Failed to upload video');
//     } finally {
//       setUploading(false);
//       setUploadProgress(prev => {
//         const newProgress = { ...prev };
//         delete newProgress[lesson.id];
//         return newProgress;
//       });
//     }
//   };

//   return (
//     <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition">
//       <div className="flex items-center gap-4 flex-1">
//         <span className="text-gray-500 font-medium">{index + 1}</span>
//         <div className="flex-1">
//           <h4 className="font-medium text-gray-800">{lesson.title}</h4>
//           <div className="flex items-center gap-3 mt-1">
//             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
//               {lesson.contentType}
//             </span>
//             {lesson.duration && (
//               <span className="text-xs text-gray-600">⏱ {lesson.duration} min</span>
//             )}
//             {lesson.contentUrl && (
//               <span className="text-xs text-green-600">✓ Video uploaded</span>
//             )}
//             {lesson.isPreview && (
//               <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
//                 Free Preview
//               </span>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-2">
//         {lesson.contentType === 'VIDEO' && !lesson.contentUrl && (
//           <label className="cursor-pointer">
//             <input
//               type="file"
//               accept="video/*"
//               onChange={handleVideoUpload}
//               className="hidden"
//               disabled={uploading}
//             />
//             <span className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm inline-block">
//               {uploading ? `Uploading ${uploadProgress}%` : 'Upload Video'}
//             </span>
//           </label>
//         )}
//         <button
//           onClick={onDelete}
//           className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
//         >
//           Delete
//         </button>
//       </div>

//       {/* Upload Progress Bar */}
//       {uploadProgress > 0 && uploadProgress < 100 && (
//         <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
//           <div
//             className="h-full bg-green-600 transition-all duration-300"
//             style={{ width: `${uploadProgress}%` }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// // Upload Thumbnail Component
// const UploadThumbnail = ({ courseId, onUpload }) => {
//   const [uploading, setUploading] = useState(false);

//   const handleUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     try {
//       setUploading(true);
//       await courseService.uploadThumbnail(courseId, file);
//       alert('Thumbnail uploaded successfully!');
//       onUpload();
//     } catch (error) {
//       console.error('Error uploading thumbnail:', error);
//       alert('Failed to upload thumbnail');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <label className="cursor-pointer">
//       <input
//         type="file"
//         accept="image/*"
//         onChange={handleUpload}
//         className="hidden"
//         disabled={uploading}
//       />
//       <span className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm inline-block">
//         {uploading ? 'Uploading...' : 'Upload Thumbnail'}
//       </span>
//     </label>
//   );
// };

// // Section Modal Component
// const SectionModal = ({ courseId, onClose, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     description: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.title.trim()) {
//       alert('Section title is required');
//       return;
//     }

//     try {
//       setLoading(true);
//       await sectionService.createSection(courseId, formData);
//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.error('Error creating section:', error);
//       alert('Failed to create section');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Section</h2>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-2">
//               Section Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               placeholder="e.g., Introduction to React"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-gray-700 font-medium mb-2">Description</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               rows="3"
//               placeholder="Brief description of this section"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex gap-3">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
//             >
//               {loading ? 'Creating...' : 'Create Section'}
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Lesson Modal Component
// // Replace the LessonModal component in your CourseBuilder.jsx with this version:

// const LessonModal = ({ courseId, section, onClose, onSuccess, setUploadProgress, course }) => {  // 🆕 Added course prop
//   const [formData, setFormData] = useState({
//     title: '',
//     contentType: 'VIDEO',
//     content: '',
//     duration: '',
//     isPreview: false,
//     isFree: false,
//     // Add Quiz basic fields
//     quizTitle: '',
//     passingScore: 80,
//   });
//   const [loading, setLoading] = useState(false);
//   const [videoFile, setVideoFile] = useState(null);
//   const [documentFile, setDocumentFile] = useState(null);
//   const [quizQuestions, setQuizQuestions] = useState([
//     { questionText: '', questionType: 'MULTIPLE_CHOICE', options: ['', ''], correctAnswer: 0, points: 1 }
//   ]);

//   // 🆕 Check if course is free
//   const isCourseFullyFree = course?.isFree || parseFloat(course?.price || 0) === 0;

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.title.trim()) {
//       alert('Lesson title is required');
//       return;
//     }

//     try {
//       setLoading(true);

//       // Create lesson first
//       const lesson = await lessonService.createLesson(courseId, section.id, formData);

//       // Upload video if selected
//       if (videoFile && formData.contentType === 'VIDEO') {
//         await lessonService.uploadLessonVideo(lesson.id, videoFile, (progress) => {
//           setUploadProgress(prev => ({ ...prev, [lesson.id]: progress }));
//         });
//       }

//       // Upload document if selected
//       if (documentFile && formData.contentType === 'DOCUMENT') {
//         await lessonService.uploadLessonResources(lesson.id, [documentFile]);
//       }

//       // Handle Quiz if selected (Assuming backend has endpoint for this or handles it via createLesson)
//       if (formData.contentType === 'QUIZ') {
//         // If the backend createLesson doesn't handle quiz nestedly, we'd call quiz service here
//         // For now, let's assume createLesson can take it or we add a note
//         console.log('Quiz Data:', { title: formData.quizTitle, questions: quizQuestions });
//       }

//       onSuccess();
//       onClose();
//     } catch (error) {
//       console.error('Error creating lesson:', error);
//       alert('Failed to create lesson');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
//       <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//           Add Lesson to: {section.title}
//         </h2>

//         <div>
//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-2">
//               Lesson Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               placeholder="e.g., Introduction to Components"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-2">Content Type</label>
//             <select
//               value={formData.contentType}
//               onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="VIDEO">Video</option>
//               <option value="TEXT">Text</option>
//               <option value="QUIZ">Quiz</option>
//               <option value="DOCUMENT">Document</option>
//             </select>
//           </div>

//           {formData.contentType === 'VIDEO' && (
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Upload Video</label>
//               <input
//                 type="file"
//                 accept="video/*"
//                 onChange={(e) => setVideoFile(e.target.files[0])}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <p className="text-sm text-gray-500 mt-1">Max file size: 500MB</p>
//             </div>
//           )}

//           {formData.contentType === 'TEXT' && (
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2">Content</label>
//               <textarea
//                 value={formData.content}
//                 onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//                 rows="6"
//                 placeholder="Write your lesson content here..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           )}

//           {formData.contentType === 'DOCUMENT' && (
//             <div className="mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
//               <label className="block text-orange-800 font-bold mb-2">📄 Upload Document</label>
//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
//                 onChange={(e) => setDocumentFile(e.target.files[0])}
//                 className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//               />
//               <p className="text-xs text-orange-600 mt-2">PDF, Word, or PowerPoint (Max 10MB)</p>
//             </div>
//           )}

//           {formData.contentType === 'QUIZ' && (
//             <div className="mb-4 bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-purple-900 font-black flex items-center gap-2 text-lg">
//                   <span>🧠</span> Quiz Builder
//                 </h3>
//                 <div className="flex gap-4">
//                   <div className="flex flex-col items-end">
//                     <label className="text-[10px] uppercase font-bold text-purple-400">Passing Score (%)</label>
//                     <input
//                       type="number"
//                       className="w-16 text-center font-bold bg-white border rounded p-1"
//                       value={formData.passingScore}
//                       onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {quizQuestions.map((q, qIndex) => (
//                 <div key={qIndex} className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 space-y-4 relative">
//                   <div className="flex justify-between items-start">
//                     <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
//                       Question #{qIndex + 1}
//                     </span>
//                     {quizQuestions.length > 1 && (
//                       <button
//                         onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex))}
//                         className="text-red-400 hover:text-red-600 font-bold text-xs"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>

//                   <input
//                     type="text"
//                     placeholder="Enter your question here..."
//                     className="w-full border-b-2 border-purple-50 focus:border-purple-500 outline-none py-2 text-gray-800 font-medium"
//                     value={q.questionText}
//                     onChange={(e) => {
//                       const newQ = [...quizQuestions];
//                       newQ[qIndex].questionText = e.target.value;
//                       setQuizQuestions(newQ);
//                     }}
//                   />

//                   <div className="space-y-2">
//                     <label className="text-[10px] uppercase font-bold text-gray-400">Options</label>
//                     {q.options.map((opt, oIndex) => (
//                       <div key={oIndex} className="flex items-center gap-2">
//                         <input
//                           type="radio"
//                           name={`correct-${qIndex}`}
//                           checked={q.correctAnswer === oIndex}
//                           onChange={() => {
//                             const newQ = [...quizQuestions];
//                             newQ[qIndex].correctAnswer = oIndex;
//                             setQuizQuestions(newQ);
//                           }}
//                         />
//                         <input
//                           type="text"
//                           className="flex-1 bg-gray-50 border-none rounded p-2 text-sm focus:bg-white transition-all"
//                           placeholder={`Option ${oIndex + 1}`}
//                           value={opt}
//                           onChange={(e) => {
//                             const newQ = [...quizQuestions];
//                             newQ[qIndex].options[oIndex] = e.target.value;
//                             setQuizQuestions(newQ);
//                           }}
//                         />
//                         {q.options.length > 2 && (
//                           <button className="text-gray-300 hover:text-red-400" onClick={() => {
//                             const newQ = [...quizQuestions];
//                             newQ[qIndex].options = q.options.filter((_, i) => i !== oIndex);
//                             setQuizQuestions(newQ);
//                           }}>×</button>
//                         )}
//                       </div>
//                     ))}
//                     <button
//                       onClick={() => {
//                         const newQ = [...quizQuestions];
//                         newQ[qIndex].options.push('');
//                         setQuizQuestions(newQ);
//                       }}
//                       className="text-purple-600 text-xs font-bold mt-2"
//                     >
//                       + Add Option
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               <button
//                 onClick={() => setQuizQuestions([...quizQuestions, { questionText: '', questionType: 'MULTIPLE_CHOICE', options: ['', ''], correctAnswer: 0, points: 1 }])}
//                 className="w-full py-4 border-2 border-dashed border-purple-200 rounded-xl text-purple-400 font-bold hover:bg-purple-100/50 transition-all"
//               >
//                 + Add Another Question
//               </button>
//             </div>
//           )}

//           <div className="mb-4">
//             <label className="block text-gray-700 font-medium mb-2">
//               Duration (minutes)
//             </label>
//             <input
//               type="number"
//               value={formData.duration}
//               onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
//               placeholder="15"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* 🆕 Lesson Access Control - CONDITIONAL RENDERING */}
//           <div className="mb-6 border-t pt-4">
//             <h4 className="font-medium text-gray-800 mb-3">Lesson Access</h4>

//             {/* Show info banner if course is free */}
//             {isCourseFullyFree ? (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
//                 <div className="flex items-start gap-3">
//                   <span className="text-2xl">🎁</span>
//                   <div>
//                     <p className="font-medium text-green-800">Free Course</p>
//                     <p className="text-sm text-green-700 mt-1">
//                       All lessons in this course are automatically free for everyone.
//                       You can still use the "Preview" option to highlight key lessons.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                 <p className="text-sm text-blue-800">
//                   💡 This is a <strong>paid course (${course?.price})</strong>.
//                   You can mark individual lessons as free to give students a preview!
//                 </p>
//               </div>
//             )}

//             <div className="space-y-3">
//               {/* Preview Toggle - Always show */}
//               <label className="flex items-start gap-3 cursor-pointer p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
//                 <input
//                   type="checkbox"
//                   checked={formData.isPreview}
//                   onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
//                   className="w-5 h-5 text-blue-600 rounded mt-1"
//                 />
//                 <div>
//                   <span className="text-gray-800 font-medium">👁 Mark as Preview</span>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Highlight this lesson in the course details page
//                   </p>
//                 </div>
//               </label>

//               {/* Free Lesson Toggle - ONLY show for PAID courses */}
//               {!isCourseFullyFree && (
//                 <label className="flex items-start gap-3 cursor-pointer p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition">
//                   <input
//                     type="checkbox"
//                     checked={formData.isFree}
//                     onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
//                     className="w-5 h-5 text-green-600 rounded mt-1"
//                   />
//                   <div>
//                     <span className="text-gray-800 font-medium">🎁 Make Lesson Free</span>
//                     <p className="text-sm text-gray-600 mt-1">
//                       Students can access this lesson without purchasing the course
//                     </p>
//                   </div>
//                 </label>
//               )}
//             </div>
//           </div>

//           <div className="flex gap-3">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 shadow-lg"
//             >
//               {loading ? 'Creating...' : 'Create Lesson'}
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };




// export default CourseBuilder;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from '../../utils/toast';
import courseService from '../../services/courseService';
import sectionService from '../../services/sectionService';
import lessonService from '../../services/lessonService';
import {
  BookOpen,
  Plus,
  Save,
  ArrowLeft,
  Upload,
  ChevronDown,
  ChevronRight,
  Trash2,
  Video,
  FileText,
  File,
  BrainCircuit,
  Clock,
  Eye,
  Gift,
  Sparkles,
  CheckCircle,
  Play,
  Edit3,
  DollarSign,
  Award,
  X,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

// Modern Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6" />,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
    }
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start gap-4 mb-6">
          <div className={`p-3 ${style.iconBg} rounded-2xl ${style.iconColor}`}>
            {style.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white py-3 rounded-xl transition-all font-bold shadow-lg ${style.confirmBtn}`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseBuilder = () => {
  const { t } = useTranslation();
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
      toast.error(t('instructor.dashboard.errors.failed_load') || 'Failed to load course data');
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
      toast.error(t('instructor.course_builder.no_sections_title'));
      return;
    }

    const hasLessons = sections.some(s => s.lessons && s.lessons.length > 0);
    if (!hasLessons) {
      toast.error(t('instructor.course_builder.no_lessons_toast') || 'Please add at least one lesson before publishing');
      return;
    }

    try {
      await courseService.updateCourse(courseId, { status: 'PUBLISHED' });
      toast.success(t('instructor.course_builder.publish_success'));
      navigate('/instructor/courses');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast.error(t('instructor.course_builder.publish_failed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('instructor.course_builder.loading_builder')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{course?.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('instructor.course_builder.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handlePublishCourse}
              className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {t('instructor.course_builder.publish')}
            </button>
            <button
              onClick={() => navigate('/instructor/courses')}
              className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {t('instructor.course_builder.save_exit')}
            </button>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 mb-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img
              src={course?.thumbnailImage || 'https://via.placeholder.com/150'}
              alt={course?.title}
              className="w-full md:w-40 h-40 object-cover rounded-2xl shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{course?.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{course?.shortDescription}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-800">
                  <Award className="w-4 h-4" />
                  {course?.level}
                </span>
                <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-purple-100 dark:border-purple-800">
                  <DollarSign className="w-4 h-4" />
                  {course?.price}
                </span>
                <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                  <BookOpen className="w-4 h-4" />
                  {sections.length} {t('course.info.sections')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Section Button */}
        <button
          onClick={handleAddSection}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 mb-10 flex items-center justify-center gap-3 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          {t('instructor.course_builder.add_new_section')}
        </button>

        {/* Sections List */}
        <div className="space-y-6">
          {sections.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
                <BookOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('instructor.course_builder.no_sections_title')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{t('instructor.course_builder.no_sections_desc')}</p>
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
            course={course}
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteSection = async () => {
    try {
      setIsDeleting(true);
      await sectionService.deleteSection(section.id);
      toast.success('Section deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error(error.response?.data?.message || 'Failed to delete section');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await lessonService.deleteLesson(lessonId);
      toast.success('Lesson deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('student.course_player.section')} {index + 1}: {section.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t('instructor.course_builder.section_count', { count: section.lessons?.length || 0 })}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onAddLesson}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('instructor.course_builder.lesson_title')}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="bg-rose-600 text-white px-4 py-2.5 rounded-xl hover:bg-rose-700 transition-all font-bold text-sm shadow-sm shadow-rose-200 dark:shadow-rose-900/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lessons List */}
        {isExpanded && (
          <div className="p-6">
            {!section.lessons || section.lessons.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t('student.student_dashboard.no_lessons') || 'No lessons yet'}</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t('instructor.course_builder.click_add_lesson') || 'Click "Add Lesson" to get started'}</p>
              </div>
            ) : (
              <div className="space-y-3">
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

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteSection}
        title={t('instructor.course_builder.delete_section_title')}
        message={t('instructor.course_builder.delete_section_confirm')}
        confirmText={t('instructor.my_courses.card.delete')}
        cancelText={t('instructor.course_builder.cancel')}
        type="danger"
      />
    </>
  );
};

// Lesson Row Component
const LessonRow = ({ lesson, index, onDelete, uploadProgress, setUploadProgress }) => {
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      toast.error('File size must be less than 500MB');
      return;
    }

    try {
      setUploading(true);
      await lessonService.uploadLessonVideo(lesson.id, file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [lesson.id]: progress }));
      });
      toast.success('Video uploaded successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[lesson.id];
        return newProgress;
      });
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'TEXT': return <FileText className="w-4 h-4" />;
      case 'QUIZ': return <BrainCircuit className="w-4 h-4" />;
      case 'DOCUMENT': return <File className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case 'VIDEO': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
      case 'TEXT': return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800';
      case 'QUIZ': return 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800';
      case 'DOCUMENT': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
      default: return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-700';
    }
  };

  return (
    <>
      <div className="relative flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group">
        <div className="flex items-center gap-4 flex-1">
          <span className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-sm">
            {index + 1}
          </span>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{lesson.title}</h4>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getContentColor(lesson.contentType)}`}>
                {getContentIcon(lesson.contentType)}
                {lesson.contentType}
              </span>
              {lesson.duration && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3" />
                  {lesson.duration} min
                </span>
              )}
              {lesson.contentUrl && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle className="w-3 h-3" />
                  {t('instructor.course_builder.video_uploaded') || 'Video uploaded'}
                </span>
              )}
              {lesson.isPreview && (
                <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100 dark:border-amber-800">
                  <Eye className="w-3 h-3" />
                  {t('student.course_player.preview_lesson')}
                </span>
              )}
              {lesson.isFree && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-800">
                  <Gift className="w-3 h-3" />
                  {t('student.course_player.free_lesson')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {lesson.contentType === 'VIDEO' && !lesson.contentUrl && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-all text-sm font-bold shadow-sm shadow-emerald-200 dark:shadow-emerald-900/20">
                <Upload className="w-4 h-4" />
                {uploading ? `${uploadProgress}%` : t('instructor.course_builder.upload_video')}
              </span>
            </label>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-rose-600 text-white px-4 py-2.5 rounded-xl hover:bg-rose-700 transition-all text-sm font-bold shadow-sm shadow-rose-200 dark:shadow-rose-900/20 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title={t('instructor.course_builder.delete_lesson_title')}
        message={t('instructor.course_builder.delete_lesson_confirm')}
        confirmText={t('instructor.my_courses.card.delete')}
        cancelText={t('instructor.course_builder.cancel')}
        type="danger"
      />
    </>
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
      toast.success('Thumbnail uploaded successfully! 🖼️');
      onUpload();
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
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
      <span className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
        <Upload className="w-4 h-4" />
        {uploading ? t('common.loading') : t('instructor.course_builder.upload_thumbnail')}
      </span>
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
      toast.error('Section title is required');
      return;
    }

    try {
      setLoading(true);
      await sectionService.createSection(courseId, formData);
      toast.success('Section created successfully! 📚');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('instructor.course_builder.add_new_module')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">
              Section Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to React"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Brief description of this section"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              {loading ? '...' : t('instructor.course_builder.create_module')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
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
const LessonModal = ({ courseId, section, onClose, onSuccess, setUploadProgress, course }) => {
  const [formData, setFormData] = useState({
    title: '',
    contentType: 'VIDEO',
    content: '',
    duration: '',
    isPreview: false,
    isFree: false,
    quizTitle: '',
    passingScore: 80,
  });
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', questionType: 'MULTIPLE_CHOICE', options: ['', ''], correctAnswer: 0, points: 1 }
  ]);

  const isCourseFullyFree = course?.isFree || parseFloat(course?.price || 0) === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    try {
      setLoading(true);

      const lesson = await lessonService.createLesson(courseId, section.id, formData);

      if (videoFile && formData.contentType === 'VIDEO') {
        await lessonService.uploadLessonVideo(lesson.id, videoFile, (progress) => {
          setUploadProgress(prev => ({ ...prev, [lesson.id]: progress }));
        });
      }

      if (documentFile && formData.contentType === 'DOCUMENT') {
        await lessonService.uploadLessonResources(lesson.id, [documentFile]);
      }

      if (formData.contentType === 'QUIZ') {
        console.log('Quiz Data:', { title: formData.quizTitle, questions: quizQuestions });
      }

      toast.success('Lesson created successfully! ✨');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-5 h-5" />;
      case 'TEXT': return <FileText className="w-5 h-5" />;
      case 'QUIZ': return <BrainCircuit className="w-5 h-5" />;
      case 'DOCUMENT': return <File className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300 custom-scrollbar-indigo">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl">
              <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('instructor.course_builder.create_lesson')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('student.course_player.section')}: {section.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">
              {t('instructor.course_builder.lesson_title')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Introduction to Components"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">{t('instructor.course_builder.content_type')}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['VIDEO', 'TEXT', 'QUIZ', 'DOCUMENT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, contentType: type })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.contentType === type
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                    }`}
                >
                  <div className={formData.contentType === type ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                    {getContentTypeIcon(type)}
                  </div>
                  <span className={`text-xs font-bold ${formData.contentType === type ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {t(`instructor.course_builder.types.${type.toLowerCase()}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {formData.contentType === 'VIDEO' && (
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <label className="block text-blue-900 dark:text-blue-400 font-bold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" />
                {t('instructor.course_builder.upload_video')}
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">{t('instructor.course_builder.max_video_size')}</p>
            </div>
          )}

          {formData.contentType === 'TEXT' && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2">{t('instructor.course_builder.content') || 'Content'}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="8"
                placeholder={t('instructor.course_builder.text_placeholder')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-400"
              />
            </div>
          )}

          {formData.contentType === 'DOCUMENT' && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <label className="block text-amber-900 dark:text-amber-400 font-bold mb-3 flex items-center gap-2">
                <File className="w-5 h-5" />
                {t('instructor.course_builder.upload_doc')}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={(e) => setDocumentFile(e.target.files[0])}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
              />
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">{t('instructor.course_builder.max_doc_size')}</p>
            </div>
          )}

          {formData.contentType === 'QUIZ' && (
            <div className="mb-4 bg-purple-50 dark:bg-purple-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-purple-900 dark:text-purple-400 font-black flex items-center gap-2 text-lg">
                  <BrainCircuit className="w-6 h-6" />
                  {t('instructor.course_builder.quiz_builder')}
                </h3>
                <div className="flex gap-4">
                  <div className="flex flex-col items-end">
                    <label className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-500 mb-1">{t('instructor.course_builder.passing_score')}</label>
                    <input
                      type="number"
                      className="w-20 text-center font-bold bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-2 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 space-y-4 relative">
                  <div className="flex justify-between items-start">
                    <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                      {t('instructor.course_builder.question')} #{qIndex + 1}
                    </span>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIndex))}
                        className="text-rose-400 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder={t('instructor.course_builder.question_placeholder')}
                    className="w-full border-b-2 border-purple-100 dark:border-purple-800 bg-transparent focus:border-purple-500 outline-none py-3 text-slate-800 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={q.questionText}
                    onChange={(e) => {
                      const newQ = [...quizQuestions];
                      newQ[qIndex].questionText = e.target.value;
                      setQuizQuestions(newQ);
                    }}
                  />

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-slate-600">{t('instructor.course_builder.options')}</label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={q.correctAnswer === oIndex}
                          onChange={() => {
                            const newQ = [...quizQuestions];
                            newQ[qIndex].correctAnswer = oIndex;
                            setQuizQuestions(newQ);
                          }}
                          className="w-5 h-5 text-purple-600"
                        />
                        <input
                          type="text"
                          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-white"
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newQ = [...quizQuestions];
                            newQ[qIndex].options[oIndex] = e.target.value;
                            setQuizQuestions(newQ);
                          }}
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            className="text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-500 transition-colors"
                            onClick={() => {
                              const newQ = [...quizQuestions];
                              newQ[qIndex].options = q.options.filter((_, i) => i !== oIndex);
                              setQuizQuestions(newQ);
                            }}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newQ = [...quizQuestions];
                        newQ[qIndex].options.push('');
                        setQuizQuestions(newQ);
                      }}
                      className="text-purple-600 text-sm font-bold mt-2 flex items-center gap-1 hover:text-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {t('instructor.course_builder.add_option')}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setQuizQuestions([...quizQuestions, { questionText: '', questionType: 'MULTIPLE_CHOICE', options: ['', ''], correctAnswer: 0, points: 1 }])}
                className="w-full py-4 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-2xl text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t('instructor.course_builder.add_question')}
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('instructor.course_builder.duration')}
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="15"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Lesson Access Control */}
          <div className="mb-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {t('instructor.course_builder.access_control')}
            </h4>

            {isCourseFullyFree ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5 mb-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">{t('student.course_player.free_lesson')}</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                      {t('instructor.course_builder.free_course_info')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t('instructor.course_builder.paid_course_info', { price: course?.price })}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Eye className="w-4 h-4" />
                    {t('instructor.course_builder.mark_preview')}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {t('instructor.course_builder.preview_desc')}
                  </p>
                </div>
              </label>

              {!isCourseFullyFree && (
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isFree}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400 rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <Gift className="w-4 h-4" />
                      {t('instructor.course_builder.mark_free')}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {t('instructor.course_builder.free_desc')}
                    </p>
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
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('instructor.course_builder.creating')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t('instructor.course_builder.create_lesson')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
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