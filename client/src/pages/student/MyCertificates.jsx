import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import certificateService from '../../services/certificateService';
import toast from '../../utils/toast';
import {
  Award,
  X,
  ExternalLink,
  Download,
  BookOpen,
  Calendar,
  User,
  Search
} from 'lucide-react';

const MyCertificates = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getMyCertificates();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const courseTitle = cert.enrollment?.course?.title || '';
    const certNumber = cert.certificateNumber || '';
    return courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {t('student.certificates.title') || 'My Certificates'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {certificates.length} {certificates.length !== 1 ? (t('student.certificates.count_plural') || 'certificates') : (t('student.certificates.count_singular') || 'certificate')}
              </p>
            </div>
          </div>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
              <Award className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('student.certificates.empty_title') || 'No certificates yet'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {t('student.certificates.empty_desc') || 'Complete courses to earn certificates'}
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold"
            >
              <BookOpen className="w-5 h-5" />
              {t('common.browse_courses') || 'Browse Courses'}
            </Link>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('student.certificates.search_placeholder') || 'Search certificates...'}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert) => {
                const course = cert.enrollment?.course;
                if (!course) return null;

                return (
                  <div
                    key={cert.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Certificate Preview */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                      <Award className="w-16 h-16 text-white/80" />
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                        {cert.certificateNumber}
                      </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="p-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        {course.instructor && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <User className="w-4 h-4" />
                            {course.instructor.firstName} {course.instructor.lastName}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/student/certificates/${cert.id}`}
                          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t('student.certificates.view') || 'View'}
                        </Link>
                        {cert.certificateUrl && (
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                            title="Download certificate"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;
