import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const StudentEnrollments = ({ statusFilter: initialStatus = 'ALL' } = {}) => {
  const { t } = useTranslation();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/enrollments/me');
        const normalized = data.data?.enrollments ?? data.enrollments ?? [];
        setEnrollments(Array.isArray(normalized) ? normalized : []);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const course = enrollment.course;
      if (!course) return false;

      if (statusFilter !== 'ALL' && enrollment.completionStatus !== statusFilter) {
        return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          course.title?.toLowerCase().includes(q) ||
          course.shortDescription?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [enrollments, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {t('student.enrollments.title', 'My Enrollments')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('student.enrollments.subtitle', 'Track your enrolled courses and progress')}
          </p>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder={t('student.enrollments.search_placeholder', 'Search your courses...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">{t('student.enrollments.filter_all', 'All')}</option>
              <option value="IN_PROGRESS">{t('student.enrollments.filter_in_progress', 'In Progress')}</option>
              <option value="COMPLETED">{t('student.enrollments.filter_completed', 'Completed')}</option>
            </select>
          </div>
        </div>

        {filteredEnrollments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-4 font-medium">
              {enrollments.length === 0
                ? t('student.enrollments.empty.title', "You haven't enrolled in any courses yet")
                : t('student.enrollments.no_match', 'No courses match your filters')}
            </p>
            <Link
              to="/courses"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold"
            >
              {t('student.enrollments.browse', 'Browse available courses')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ hasEnrollments }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center">
      {hasEnrollments ? (
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
          {t('student.my_courses.no_match')}
        </p>
      ) : (
        <>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-4 font-medium">
            {t('student.dashboard.no_courses')}
          </p>
          <Link
            to="/courses"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold"
          >
            {t('student.my_courses.browse_available')}
          </Link>
        </>
      )}
    </div>
  );
};

const EnrollmentCard = ({ enrollment }) => {
  const { t } = useTranslation();
  const course = enrollment.course;
  if (!course) return null;

  const progress = enrollment.progressPercentage ?? 0;
  const completed = enrollment.completionStatus === 'COMPLETED';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link to={`/student/courses/${course.id}/learn`}>
        <div className="relative">
          <img
            src={course.thumbnailImage || 'https://placehold.co/400x225'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <span
            className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${
              completed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}
          >
            {completed ? t('course.status.completed') : t('course.status.in_progress')}
          </span>
        </div>
      </Link>

      <div className="p-6">
        <Link to={`/student/courses/${course.id}/learn`}>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {course.title}
          </h3>
        </Link>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 font-medium">
          {course.shortDescription}
        </p>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className="uppercase tracking-wider">{t('student.course_card.progress')}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 shadow-inner">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                completed ? 'bg-emerald-500' : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {enrollment.lastAccessed && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium italic">
            {t('student.course_card.last_accessed')}: {new Date(enrollment.lastAccessed).toLocaleDateString()}
          </p>
        )}

        <Link
          to={`/student/courses/${course.id}/learn`}
          className="block w-full bg-indigo-600 dark:bg-indigo-500 text-white text-center py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200"
        >
          {completed ? t('student.my_courses.review_course') : t('student.my_courses.continue_learning')}
        </Link>
      </div>
    </div>
  );
};

export default StudentEnrollments;
