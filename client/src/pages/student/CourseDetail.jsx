// /* eslint-disable no-unused-vars */
// import { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import courseService from '../../services/courseService';
// import enrollmentService from '../../services/enrollmentService';
// import api from '../../services/api';
// import toast from '../../utils/toast';

// const CourseDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [enrollmentStatus, setEnrollmentStatus] = useState(null);
//   const [isInCart, setIsInCart] = useState(false);
//   const [enrolling, setEnrolling] = useState(false);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [showStickyBar, setShowStickyBar] = useState(false);

//   const heroRef = useRef(null);

//   const fetchCourseDetails = async () => {
//     try {
//       setLoading(true);
//       const courseData = await courseService.getCourse(id);
//       setCourse(courseData);

//       // Check enrollment and cart status if user is logged in
//       if (user) {
//         const [enrollmentData, cartData] = await Promise.all([
//           enrollmentService.checkEnrollment(id),
//           api.get(`/cart/check/${id}`)
//         ]);
//         setEnrollmentStatus(enrollmentData);
//         setIsInCart(cartData.data?.success ? cartData.data.data.isInCart : false);
//       }
//     } catch (error) {
//       console.error('Error fetching course:', error);
//       alert('Course not found');
//       navigate('/courses');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCourseDetails();
//   }, [id, user]);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (heroRef.current) {
//         const heroBottom = heroRef.current.getBoundingClientRect().bottom;
//         setShowStickyBar(heroBottom < 0);
//       }
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const handleEnroll = async () => {
//     if (!user) {
//       navigate('/login', { state: { from: `/courses/${id}` } });
//       return;
//     }

//     // If course is already in cart, redirect to cart page
//     if (isInCart) {
//       navigate('/cart');
//       return;
//     }

//     // If course is not free, add to cart first then redirect
//     if (!course.isFree && parseFloat(course.price) > 0) {
//       try {
//         setEnrolling(true);

//         // Add to cart using the API
//         const response = await api.post('/cart', { courseId: id });

//         if (response.data.success) {
//           // Update cart status
//           setIsInCart(true);

//           // Dispatch event to update cart count
//           window.dispatchEvent(new Event('cart-updated'));

//           // Redirect to cart page
//           navigate('/cart');
//         }
//       } catch (error) {
//         console.error('Error adding to cart:', error);
//         alert(error.response?.data?.message || 'Failed to add to cart');
//       } finally {
//         setEnrolling(false);
//       }
//       return;
//     }

//     // Free course - enroll directly
//     try {
//       setEnrolling(true);
//       await enrollmentService.enrollInCourse(id);
//       toast.success('Successfully enrolled in course!');
//       navigate(`/student/courses/${id}/learn`);
//     } catch (error) {
//       console.error('Error enrolling:', error);
//       alert(error.response?.data?.message || 'Failed to enroll in course');
//     } finally {
//       setEnrolling(false);
//     }
//   };

//   const handleGoToCourse = () => {
//     navigate(`/student/courses/${id}/learn`);
//   };

//   // NEW: Handle clicking on free/preview lessons
//   const handleStartFreeLessons = () => {
//     if (!user) {
//       navigate('/login', { state: { from: `/courses/${id}` } });
//       return;
//     }
//     // Go directly to course player - it will handle access control per lesson
//     navigate(`/student/courses/${id}/learn`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white text-blue-600">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
//           <p className="font-medium animate-pulse">Loading amazing content...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!course) return null;

//   const totalLessons = course.sections?.reduce((sum, section) => sum + (section.lessons?.length || 0), 0) || 0;
//   const totalDuration = course.sections?.reduce((sum, section) =>
//     sum + (section.lessons?.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0) || 0), 0) || 0;
//   const freeLessonsCount = course.sections?.reduce((sum, section) =>
//     sum + (section.lessons?.filter(l => l.isPreview || l.isFree).length || 0), 0) || 0;

//   return (
//     <div className="min-h-screen bg-gray-50/50 pb-20">
//       {/* Sticky Purchase Bar */}
//       <div className={`fixed top-0 left-0 right-0 bg-white shadow-lg z-50 transform transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
//         <div className="container mx-auto px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <h2 className="font-bold text-gray-900 line-clamp-1 max-w-[300px]">{course.title}</h2>
//             <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
//               <span className="text-yellow-400">★</span>
//               <span className="font-bold">{course.averageRating?.toFixed(1)}</span>
//             </div>
//           </div>
//           <div className="flex items-center gap-6">
//             <div className="hidden md:block">
//               <span className="text-2xl font-bold text-gray-900">${course.discountPrice || course.price}</span>
//             </div>
//             <button
//               onClick={handleEnroll}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition transform active:scale-95 shadow-md"
//             >
//               {enrollmentStatus?.isEnrolled ? 'Go to Course' : isInCart ? 'Go to Cart' : (course.isFree || course.price === 0) ? 'Enroll Now' : 'Buy Now'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Hero Section */}
//       <div ref={heroRef} className="relative bg-[#1c1d1f] text-white overflow-hidden">
//         <div className="absolute inset-0 opacity-20">
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent"></div>
//         </div>
//         <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//             <div className="lg:col-span-2">
//               <nav className="flex gap-2 text-sm font-medium text-blue-400 mb-6">
//                 <span className="hover:underline cursor-pointer">Courses</span>
//                 <span>/</span>
//                 <span className="hover:underline cursor-pointer">{course.category?.name}</span>
//               </nav>

//               <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
//                 {course.title}
//               </h1>

//               <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
//                 {course.shortDescription}
//               </p>

//               <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
//                 <div className="flex items-center bg-yellow-400/20 px-3 py-1 rounded-full text-yellow-300 font-bold border border-yellow-400/30">
//                   <span className="mr-2">★</span>
//                   {course.averageRating?.toFixed(1) || '0.0'} ({course.totalReviews || 0} reviews)
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-300">
//                   <span className="text-blue-400">👥</span>
//                   <span className="font-medium">{course.totalEnrollments || 0} students</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-300">
//                   <span className="text-blue-400">📅</span>
//                   <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
//                 </div>
//               </div>

//               {/* Purchase Box in Hero */}
//               <div className="mt-10 p-1 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 inline-flex flex-col md:flex-row items-center gap-8 shadow-2xl">
//                 <div className="px-8 py-4 flex flex-col justify-center">
//                   <div className="flex items-baseline gap-3">
//                     <span className="text-4xl font-black text-white">${course.discountPrice || course.price}</span>
//                     {course.discountPrice && (
//                       <span className="text-lg text-gray-400 line-through">${course.price}</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4 px-2 pb-2 md:pb-0 md:pr-2 w-full md:w-auto">
//                   <button
//                     onClick={handleEnroll}
//                     disabled={enrolling}
//                     className="w-full bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all transform active:scale-95 shadow-xl shadow-blue-900/40 whitespace-nowrap min-w-[200px]"
//                   >
//                     {enrolling ? '...' : enrollmentStatus?.isEnrolled ? 'Go to Course' : isInCart ? 'Go to Cart' : (course.isFree || course.price === 0) ? 'Enroll Free' : 'Buy Now'}
//                   </button>
//                   {!enrollmentStatus?.isEnrolled && freeLessonsCount > 0 && (
//                     <button
//                       onClick={handleStartFreeLessons}
//                       className="bg-white/5 hover:bg-white/10 text-white px-6 py-5 rounded-2xl font-bold transition-all border border-white/10 active:scale-95"
//                     >
//                       Try Preview
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-8 flex items-center gap-4">
//                 <img
//                   src={course.instructor?.profilePicture || 'https://via.placeholder.com/60'}
//                   className="w-14 h-14 rounded-full border-2 border-blue-600 shadow-xl object-cover"
//                   alt="Instructor"
//                 />
//                 <div>
//                   <p className="text-sm text-gray-400">Created by</p>
//                   <p className="font-bold text-lg text-blue-400">{course.instructor?.firstName} {course.instructor?.lastName}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Right Side: Hero Preview */}
//             <div className="lg:col-span-1">
//               <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
//                 <div className="relative group cursor-pointer aspect-video" onClick={handleStartFreeLessons}>
//                   <img
//                     src={course.thumbnailImage || 'https://via.placeholder.com/400x225'}
//                     alt={course.title}
//                     className="w-full h-full object-cover"
//                   />
//                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
//                     <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
//                       <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600">
//                         <span className="text-2xl ml-1">▶</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-sm tracking-widest uppercase opacity-80">
//                     Course Preview
//                   </div>
//                 </div>

//                 <div className="p-4 md:p-6 bg-white/5 space-y-4">
//                   <div className="flex items-center justify-center gap-6">
//                     <HeroStat icon="⏱️" text={`${course.estimatedDuration || Math.floor(totalDuration / 60)}h`} />
//                     <HeroStat icon="📚" text={`${totalLessons} lessons`} />
//                     <HeroStat icon="🌐" text={course.language === 'en' ? 'English' : 'French'} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 mt-8 md:mt-[0] relative z-20">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
//           <div className="lg:col-span-3 space-y-12">

//             {/* What you'll learn */}
//             {course.outcomes?.length > 0 && (
//               <section className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
//                 <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//                   {course.outcomes.map((outcome, idx) => (
//                     <div key={idx} className="flex gap-3 text-gray-700">
//                       <span className="text-blue-600 font-bold shrink-0">✓</span>
//                       <span className="text-sm md:text-base">{outcome.outcome}</span>
//                     </div>
//                   ))}
//                 </div>
//               </section>
//             )}

//             {/* Course Content (Curriculum) */}
//             <section>
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
//                 <div className="text-sm text-gray-500 font-medium">
//                   {course.sections?.length} sections • {totalLessons} lessons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total length
//                 </div>
//               </div>
//               <CurriculumTab sections={course.sections} />
//             </section>

//             {/* Description Tab & Review Mix */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//               <div className="flex border-b">
//                 <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
//                 <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} label="Reviews" />
//               </div>
//               <div className="p-8">
//                 {activeTab === 'overview' && (
//                   <div className="prose prose-blue max-w-none">
//                     <h3 className="text-xl font-bold mb-4">Description</h3>
//                     <div className="text-gray-700 leading-relaxed whitespace-pre-line">
//                       {course.fullDescription || course.shortDescription}
//                     </div>
//                   </div>
//                 )}
//                 {activeTab === 'reviews' && (
//                   <ReviewsTab reviews={course.reviews} courseId={course.id} />
//                 )}
//               </div>
//             </div>

//             {/* Instructor Bios */}
//             <InstructorInfo instructor={course.instructor} />
//           </div>

//           {/* Improved Sidebar Content */}
//           <div className="lg:col-span-1">
//             <div className="sticky top-28 space-y-8">
//               <TrustGrid />
//               <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl">
//                 <h4 className="font-bold mb-2">30-Day Guarantee</h4>
//                 <p className="text-xs opacity-90 leading-relaxed">Not satisfied? Get a full refund within 30 days of purchase. No questions asked.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const HeroStat = ({ icon, text }) => (
//   <div className="flex flex-col items-center gap-1">
//     <span className="text-xl">{icon}</span>
//     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{text}</span>
//   </div>
// );

// const TrustGrid = () => (
//   <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
//     <h4 className="font-bold text-gray-900 border-b pb-4">This course includes:</h4>
//     <div className="space-y-4">
//       <FeatureIconBox icon="📱" text="Access on Mobile & TV" />
//       <FeatureIconBox icon="♾️" text="Full Lifetime Access" />
//       <FeatureIconBox icon="🎓" text="Professional Certificate" />
//       <FeatureIconBox icon="📁" text="Downloadable Resources" />
//     </div>
//   </div>
// );

// const FeatureIconBox = ({ icon, text }) => (
//   <div className="flex items-center gap-3 text-sm text-gray-600 group">
//     <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
//       <span className="text-lg">{icon}</span>
//     </div>
//     <span className="font-medium">{text}</span>
//   </div>
// );

// // Tab Button Component
// const TabButton = ({ active, onClick, label }) => (
//   <button
//     onClick={onClick}
//     className={`px-8 py-4 font-bold transition-all relative ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
//       }`}
//   >
//     {label}
//     {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
//   </button>
// );

// // Curriculum Tab
// const CurriculumTab = ({ sections }) => {
//   const [expandedSections, setExpandedSections] = useState([sections?.[0]?.id]);

//   const toggleSection = (id) => {
//     setExpandedSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
//   };

//   if (!sections?.length) return <p className="text-gray-500 italic">Curriculum is being prepared...</p>;

//   return (
//     <div className="space-y-1">
//       {sections.map((section, idx) => (
//         <div key={section.id} className="bg-white border border-gray-200 overflow-hidden first:rounded-t-xl last:rounded-b-xl">
//           <button
//             onClick={() => toggleSection(section.id)}
//             className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
//           >
//             <div className="flex items-center gap-4">
//               <span className={`transition-transform duration-200 ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`}>▼</span>
//               <h3 className="font-bold text-gray-800">
//                 {section.title}
//               </h3>
//             </div>
//             <span className="text-sm text-gray-500 font-medium">
//               {section.lessons?.length || 0} lessons
//             </span>
//           </button>

//           {expandedSections.includes(section.id) && (
//             <div className="divide-y divide-gray-100 border-t border-gray-100">
//               {section.lessons?.map((lesson, lIdx) => (
//                 <div key={lesson.id} className="flex items-center justify-between p-4 pl-14 hover:bg-gray-50/80">
//                   <div className="flex items-center gap-3">
//                     <span className="text-gray-400 text-xs w-4">{lIdx + 1}</span>
//                     <span className="text-sm md:text-base text-gray-700">{lesson.title}</span>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     {lesson.isPreview && (
//                       <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Preview</span>
//                     )}
//                     <span className="text-xs text-gray-400">{lesson.duration} min</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// // Reviews Tab
// const ReviewsTab = ({ reviews, courseId }) => {
//   const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-100">
//         <div className="text-center">
//           <div className="text-6xl font-black text-blue-600 mb-2">{avg.toFixed(1)}</div>
//           <div className="flex text-yellow-500 text-sm mb-1">★★★★★</div>
//           <div className="text-xs font-bold text-gray-500 uppercase">Course Rating</div>
//         </div>
//         <div className="flex-1 space-y-2">
//           {[5, 4, 3, 2, 1].map(star => {
//             const count = reviews?.filter(r => Math.round(r.rating) === star).length || 0;
//             const perc = reviews?.length ? (count / reviews.length) * 100 : 0;
//             return (
//               <div key={star} className="flex items-center gap-3 text-sm">
//                 <div className="w-12 text-gray-600 font-medium">{star} stars</div>
//                 <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
//                   <div className="h-full bg-gray-500 rounded-full" style={{ width: `${perc}%` }}></div>
//                 </div>
//                 <div className="w-8 text-gray-400 text-xs">{Math.round(perc)}%</div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="space-y-6">
//         {reviews?.map(review => (
//           <div key={review.id} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition">
//             <img src={review.user?.profilePicture || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
//             <div className="flex-1">
//               <div className="flex items-center justify-between mb-1">
//                 <h4 className="font-bold text-gray-900">{review.user?.firstName} {review.user?.lastName}</h4>
//                 <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
//               </div>
//               <div className="flex text-yellow-500 text-[10px] mb-2">
//                 {[...Array(5)].map((_, i) => <span key={i}>{i < review.rating ? '★' : '☆'}</span>)}
//               </div>
//               <p className="text-gray-700 text-sm leading-relaxed">{review.reviewText}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Instructor Info Component
// const InstructorInfo = ({ instructor }) => (
//   <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
//     <h2 className="text-2xl font-bold mb-8">Instructor</h2>
//     <div className="flex flex-col md:flex-row gap-8 items-start">
//       <div className="shrink-0 flex flex-col items-center">
//         <img src={instructor?.profilePicture || 'https://via.placeholder.com/120'} className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-blue-50" />
//         <div className="text-center space-y-1">
//           <div className="text-sm font-bold text-gray-900">4.8 Instructor Rating</div>
//           <div className="text-sm text-gray-500 font-medium">1,240 Reviews</div>
//           <div className="text-sm text-gray-500 font-medium">10,500 Students</div>
//         </div>
//       </div>
//       <div>
//         <h3 className="text-xl font-bold text-blue-600 mb-4">{instructor?.firstName} {instructor?.lastName}</h3>
//         <div className="text-gray-700 leading-relaxed text-sm md:text-base">
//           {instructor?.bio || "Expert instructor with years of industry experience. Passionate about teaching and helping students achieve their career goals."}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // Course Features Component
// const CourseFeatures = ({ totalLessons, totalDuration }) => (
//   <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
//     <h3 className="font-bold text-gray-900">Experience our platform</h3>
//     <div className="space-y-4">
//       <FeatureItem icon="🎓" text="Professional Certificate" />
//       <FeatureItem icon="💬" text="Instructor Support Pool" />
//       <FeatureItem icon="📁" text="Downloadable Resources" />
//       <FeatureItem icon="📱" text="Seamless Mobile Experience" />
//     </div>
//   </div>
// );

// // Helper Components
// const FeatureItem = ({ icon, text }) => (
//   <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
//     <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
//       {icon}
//     </span>
//     {text}
//   </div>
// );

// const FeatureItemTiny = ({ icon, text }) => (
//   <div className="flex items-center gap-3 text-xs text-gray-600">
//     <span className="text-sm">{icon}</span>
//     <span>{text}</span>
//   </div>
// );

// export default CourseDetail;

/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import api from '../../services/api';
import toast from '../../utils/toast';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Play,
  Award,
  Download,
  Smartphone,
  // eslint-disable-next-line no-shadow-restricted-names
  Infinity,
  Globe,
  Calendar,
  ShoppingCart,
  Sparkles,
  Eye,
  Shield,
  MessageCircle,
  FileText
} from 'lucide-react';

const CourseDetail = () => {
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

  const handleGoToCourse = () => {
    navigate(`/student/courses/${id}/learn`);
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading course details...</p>
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
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Sticky Purchase Bar */}
      <div className={`fixed top-0 left-0 right-0 bg-white shadow-lg z-50 transform transition-transform duration-300 border-b border-slate-100 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-900 line-clamp-1 max-w-[300px]">{course.title}</h2>
            <div className="hidden sm:flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-900">{course.averageRating?.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <span className="text-2xl font-black text-slate-900">${course.discountPrice || course.price}</span>
            </div>
            <button
              onClick={handleEnroll}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
            >
              {enrollmentStatus?.isEnrolled ? 'Go to Course' : isInCart ? 'Go to Cart' : (course.isFree || course.price === 0) ? 'Enroll Now' : 'Buy Now'}
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
                <span className="hover:text-white cursor-pointer transition-colors">Courses</span>
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
                    {course.averageRating?.toFixed(1) || '0.0'} ({course.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{course.totalEnrollments || 0} students</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-200">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Purchase Box */}
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-white">${course.discountPrice || course.price}</span>
                    {course.discountPrice && (
                      <span className="text-xl text-indigo-300 line-through">${course.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="flex-1 md:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-2"
                    >
                      {enrolling ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : enrollmentStatus?.isEnrolled ? (
                        <>
                          <Play className="w-5 h-5" />
                          Go to Course
                        </>
                      ) : isInCart ? (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Go to Cart
                        </>
                      ) : (course.isFree || course.price === 0) ? (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Enroll Free
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5" />
                          Buy Now
                        </>
                      )}
                    </button>
                    {!enrollmentStatus?.isEnrolled && freeLessonsCount > 0 && (
                      <button
                        onClick={handleStartFreeLessons}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl font-bold transition-all border border-white/20 flex items-center gap-2"
                      >
                        <Eye className="w-5 h-5" />
                        Try Preview
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
                  <p className="text-sm text-indigo-300 font-medium">Created by</p>
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
                      Course Preview
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-white/5 grid grid-cols-3 gap-4">
                  <HeroStat icon={<Clock className="w-5 h-5" />} text={`${course.estimatedDuration || Math.floor(totalDuration / 60)}h`} />
                  <HeroStat icon={<BookOpen className="w-5 h-5" />} text={`${totalLessons} lessons`} />
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
              <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  What you'll learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{outcome.outcome}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Course Content */}
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  Course Content
                </h2>
                <div className="text-sm text-slate-600 font-semibold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  {course.sections?.length} sections • {totalLessons} lessons • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
              </div>
              <CurriculumTab sections={course.sections} />
            </section>

            {/* Tabs */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
                <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} label="Reviews" />
              </div>
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-xl font-bold mb-4 text-slate-900">Description</h3>
                    <div className="text-slate-700 leading-relaxed whitespace-pre-line">
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
              <div className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl text-white shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6" />
                  <h4 className="font-bold">30-Day Guarantee</h4>
                </div>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  Not satisfied? Get a full refund within 30 days of purchase. No questions asked.
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

const TrustGrid = () => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <h4 className="font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">This course includes:</h4>
    <div className="space-y-4">
      <FeatureIconBox icon={<Smartphone className="w-5 h-5 text-blue-600" />} text="Access on Mobile & TV" />
      <FeatureIconBox icon={<Infinity className="w-5 h-5 text-purple-600" />} text="Full Lifetime Access" />
      <FeatureIconBox icon={<Award className="w-5 h-5 text-amber-600" />} text="Professional Certificate" />
      <FeatureIconBox icon={<Download className="w-5 h-5 text-emerald-600" />} text="Downloadable Resources" />
    </div>
  </div>
);

const FeatureIconBox = ({ icon, text }) => (
  <div className="flex items-center gap-3 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
      {icon}
    </div>
    <span className="text-sm font-semibold text-slate-700">{text}</span>
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-8 py-4 font-bold transition-all relative ${
      active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
    }`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-full"></div>}
  </button>
);

const CurriculumTab = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState([sections?.[0]?.id]);

  const toggleSection = (id) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (!sections?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Curriculum is being prepared...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="bg-white border border-slate-200 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`transition-transform duration-200 ${expandedSections.includes(section.id) ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-900">{section.title}</h3>
            </div>
            <span className="text-sm text-slate-500 font-semibold bg-slate-50 px-3 py-1 rounded-lg">
              {section.lessons?.length || 0} lessons
            </span>
          </button>

          {expandedSections.includes(section.id) && (
            <div className="border-t border-slate-100 bg-slate-50">
              {section.lessons?.map((lesson, lIdx) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 pl-16 hover:bg-white transition-colors border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-slate-400 text-sm font-bold w-6">{lIdx + 1}</span>
                    <span className="text-slate-700 font-medium">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.isPreview && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                        <Eye className="w-3 h-3" />
                        Preview
                      </span>
                    )}
                    {lesson.isFree && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                        Free
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-semibold">
                      <Clock className="w-3 h-3" />
                      {lesson.duration} min
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

const ReviewsTab = ({ reviews, courseId }) => {
  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-100">
          <div className="text-6xl font-black text-indigo-600 mb-3">{avg.toFixed(1)}</div>
          <div className="flex text-amber-400 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400" />
            ))}
          </div>
          <div className="text-sm font-bold text-slate-600 uppercase tracking-wider">Course Rating</div>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews?.filter(r => Math.round(r.rating) === star).length || 0;
            const perc = reviews?.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="w-16 text-slate-600 font-semibold text-sm">{star} stars</div>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all" style={{ width: `${perc}%` }}></div>
                </div>
                <div className="w-12 text-slate-500 text-sm font-bold">{Math.round(perc)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {reviews?.map(review => (
          <div key={review.id} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <img
              src={review.user?.profilePicture || 'https://via.placeholder.com/40'}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
              alt="User"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900">{review.user?.firstName} {review.user?.lastName}</h4>
                <span className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400' : ''}`} />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed">{review.reviewText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorInfo = ({ instructor }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
    <h2 className="text-2xl font-bold mb-8 text-slate-900 flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-xl">
        <Users className="w-6 h-6 text-blue-600" />
      </div>
      Instructor
    </h2>
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <div className="flex flex-col items-center">
        <img
          src={instructor?.profilePicture || 'https://via.placeholder.com/120'}
          className="w-32 h-32 rounded-full object-cover mb-4 ring-4 ring-indigo-50 shadow-lg"
          alt="Instructor"
        />
        <div className="text-center space-y-2">
          <div className="flex items-center gap-1 justify-center">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-slate-900">4.8 Rating</span>
          </div>
          <div className="text-sm text-slate-600 font-medium">1,240 Reviews</div>
          <div className="text-sm text-slate-600 font-medium">10,500 Students</div>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-indigo-600 mb-4">
          {instructor?.firstName} {instructor?.lastName}
        </h3>
        <div className="text-slate-700 leading-relaxed">
          {instructor?.bio || "Expert instructor with years of industry experience. Passionate about teaching and helping students achieve their career goals."}
        </div>
      </div>
    </div>
  </div>
);


export default CourseDetail;