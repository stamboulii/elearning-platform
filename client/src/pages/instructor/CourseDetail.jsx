import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import toast from '../../utils/toast';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Play,
  Award,
  Edit,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Video,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const InstructorCourseDetail = () => {
  const { courseId: id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await courseService.getCourse(id);

        // Verify instructor owns this course
        if (courseData.instructor?.id !== user?.id) {
          alert('You do not have permission to view this course');
          navigate('/instructor/courses');
          return;
        }

        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
        alert('Course not found');
        navigate('/instructor/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.sections?.reduce((sum, section) => sum + (section.lessons?.length || 0), 0) || 0;
  const totalDuration = course.sections?.reduce((sum, section) =>
    sum + (section.lessons?.reduce((lessonSum, lesson) => lessonSum + (lesson.duration || 0), 0) || 0), 0) || 0;

  // Calculate revenue (estimate based on enrollments and price)
  const estimatedRevenue = (course.totalEnrollments || 0) * (parseFloat(course.discountPrice || course.price) || 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-300 pb-20">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <StatusBadge status={course.status} />
                <span className="text-sm text-slate-500 font-medium">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl">
                {course.shortDescription}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/courses/${id}`)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              label="Total Students"
              value={course.totalEnrollments || 0}
              bgColor="bg-blue-50"
            />
            <MetricCard
              icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
              label="Revenue"
              value={`$${estimatedRevenue.toFixed(0)}`}
              bgColor="bg-emerald-50"
            />
            <MetricCard
              icon={<Star className="w-5 h-5 text-amber-600" />}
              label="Rating"
              value={course.averageRating?.toFixed(1) || '0.0'}
              subValue={`${course.totalReviews || 0} reviews`}
              bgColor="bg-amber-50"
            />
            <MetricCard
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              label="Completion Rate"
              value="68%"
              bgColor="bg-purple-50"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
                <TabButton active={activeTab === 'curriculum'} onClick={() => setActiveTab('curriculum')} label="Curriculum" />
                <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} label="Students" />
                <TabButton active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} label="Reviews" />
              </div>

              <div className="p-6">
                {activeTab === 'overview' && <OverviewTab course={course} />}
                {activeTab === 'curriculum' && <CurriculumTab sections={course.sections} courseId={id} />}
                {activeTab === 'students' && <StudentsTab courseId={id} totalStudents={course.totalEnrollments} />}
                {activeTab === 'reviews' && <ReviewsTab reviews={course.reviews} />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Course Details */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                  Course Details
                </h3>
                <div className="space-y-4">
                  <DetailRow icon={<BookOpen className="w-4 h-4 text-indigo-600" />} label="Lessons" value={totalLessons} />
                  <DetailRow icon={<Clock className="w-4 h-4 text-purple-600" />} label="Duration" value={`${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`} />
                  <DetailRow icon={<DollarSign className="w-4 h-4 text-emerald-600" />} label="Price" value={`$${course.discountPrice || course.price}`} />
                  <DetailRow icon={<FileText className="w-4 h-4 text-blue-600" />} label="Category" value={course.category?.name || 'N/A'} />
                  <DetailRow icon={<Award className="w-4 h-4 text-amber-600" />} label="Level" value={course.level || 'N/A'} />
                </div>
              </div>

              {/* Publishing Status */}
              {course.status === 'draft' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-2xl transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Draft Course</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                        This course is not yet published. Complete all sections and submit for review.
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-3 bg-amber-600 dark:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-amber-700 dark:hover:bg-amber-700 transition-colors">
                    Publish Course
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    draft: { icon: <Edit className="w-3 h-3" />, label: 'Draft', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
    published: { icon: <CheckCircle className="w-3 h-3" />, label: 'Published', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    archived: { icon: <XCircle className="w-3 h-3" />, label: 'Archived', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' }
  };

  const { icon, label, color } = config[status] || config.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-lg border ${color}`}>
      {icon}
      {label}
    </span>
  );
};

const MetricCard = ({ icon, label, value, subValue, bgColor }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className={`w-10 h-10 ${bgColor} dark:opacity-80 rounded-xl flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
    <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</div>
    {subValue && <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{subValue}</div>}
  </div>
);

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-semibold transition-all relative ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    {label}
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
  </button>
);

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
  </div>
);

const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
  >
    <div className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {icon}
    </div>
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
      {label}
    </span>
  </button>
);

const OverviewTab = ({ course }) => (
  <div className="space-y-6">
    {/* Description */}
    <div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Description</h3>
      <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
        {course.fullDescription || course.shortDescription}
      </div>
    </div>

    {/* Learning Outcomes */}
    {course.outcomes?.length > 0 && (
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Learning Outcomes</h3>
        <div className="space-y-2">
          {course.outcomes.map((outcome, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300">{outcome.outcome}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Requirements */}
    {course.requirements?.length > 0 && (
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Requirements</h3>
        <div className="space-y-2">
          {course.requirements.map((req, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0 mt-2"></div>
              <span className="text-slate-700 dark:text-slate-300">{req.requirement}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const CurriculumTab = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState([sections?.[0]?.id]);

  const toggleSection = (id) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (!sections?.length) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Content Yet</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Start building your course by adding sections and lessons.</p>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Add First Section
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`transition-transform duration-200 ${expandedSections.includes(section.id) ? 'rotate-90' : ''}`}>
                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
              {section.lessons?.length || 0} lessons
            </span>
          </button>

          {expandedSections.includes(section.id) && (
            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {section.lessons?.map((lesson, lIdx) => (
                <div key={lesson.id} className="flex items-center justify-between p-4 pl-12 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-bold w-6">{lIdx + 1}</span>
                    <Play className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{lesson.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.isPreview && (
                      <span className="text-xs font-bold uppercase bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                        Preview
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
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

const StudentsTab = ({ courseId, totalStudents }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await enrollmentService.getCourseStudents(courseId);
        setStudents(data || []);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load student list');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading student list...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Students Enrolled</h3>
        <p className="text-slate-600 dark:text-slate-400">When students enroll in your course, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enrolled Students</h3>
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full">
          {students.length} Total
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-100 dark:border-slate-800">
              <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
              <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Progress</th>
              <th className="pb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Enrollment Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {students.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={enrollment.user?.profilePicture || 'https://via.placeholder.com/32'}
                      className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
                      alt="Avatar"
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {enrollment.user?.firstName} {enrollment.user?.lastName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {enrollment.user?.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                      {enrollment.progressPercentage}%
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${enrollment.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReviewsTab = ({ reviews }) => {
  const avg = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (!reviews?.length) {
    return (
      <div className="text-center py-12">
        <Star className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Reviews Yet</h3>
        <p className="text-slate-600 dark:text-slate-400">Students haven't left any reviews for this course.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <div className="text-center">
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{avg.toFixed(1)}</div>
          <div className="flex text-amber-400 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 font-semibold">{reviews.length} reviews</div>
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => Math.round(r.rating) === star).length;
            const perc = (count / reviews.length) * 100;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="w-12 text-slate-600 dark:text-slate-400 font-semibold text-sm">{star}★</div>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${perc}%` }}></div>
                </div>
                <div className="w-12 text-slate-500 dark:text-slate-500 text-sm font-semibold text-right">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <img
              src={review.user?.profilePicture || 'https://via.placeholder.com/40'}
              className="w-10 h-10 rounded-full object-cover"
              alt="User"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {review.user?.firstName} {review.user?.lastName}
                </h4>
                <span className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400' : ''}`} />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">{review.reviewText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorCourseDetail;