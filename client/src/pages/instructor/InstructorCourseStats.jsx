import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Users,
    Euro,
    TrendingUp,
    Star,
    ArrowLeft,
    Calendar,
    Search,
    Download,
    Filter,
    CheckCircle2,
    Clock,
    User
} from 'lucide-react';
import api from '../../services/api';
import toast from '../../utils/toast';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const InstructorCourseStats = () => {
    const { t } = useTranslation();
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, paid, free

    useEffect(() => {
        fetchStats();
    }, [courseId]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/instructor-analytics/courses/${courseId}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching course stats:', error);
            toast.error('Failed to load course statistics');
            // If unauthorized or not found, go back
            if (error.response?.status === 403 || error.response?.status === 404) {
                navigate('/instructor/courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = data?.students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterType === 'paid') return matchesSearch && student.isPaid;
        if (filterType === 'free') return matchesSearch && !student.isPaid;
        return matchesSearch;
    }) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const { course, stats } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/instructor/courses')}
                            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-[300px] sm:max-w-md">
                            {course.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchStats}
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Course Info Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-8 flex flex-col md:flex-row gap-6 items-center">
                    <img
                        src={course.thumbnailImage || 'https://via.placeholder.com/150'}
                        className="w-32 h-20 object-cover rounded-xl shadow-inner"
                        alt=""
                    />
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                                {course.category}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Created {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Course Performance</h2>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(`/instructor/courses/${courseId}/builder`)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            Edit Content
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Users className="w-6 h-6 text-blue-600" />}
                        label="Total Students"
                        value={stats.totalEnrollments}
                        subValue={`${stats.paidEnrollments} Paid • ${stats.totalEnrollments - stats.paidEnrollments} Free`}
                        color="blue"
                    />
                    <StatCard
                        icon={<Euro className="w-6 h-6 text-emerald-600" />}
                        label="Total Revenue"
                        value={`${stats.totalRevenue.toFixed(2)}€`}
                        subValue="Lifetime earnings"
                        color="emerald"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                        label="Avg. Completion"
                        value={`${stats.averageProgress}%`}
                        subValue="Student progress overall"
                        color="purple"
                    />
                    <StatCard
                        icon={<Star className="w-6 h-6 text-amber-600" />}
                        label="Reviews"
                        value={stats.totalReviews}
                        subValue="Student feedback"
                        color="amber"
                    />
                </div>

                {/* Students Table Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Enrolled Students</h3>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 sm:flex-none sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Filter */}
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="all">All Access</option>
                                <option value="paid">Paid Only</option>
                                <option value="free">Free Only</option>
                            </select>
                        </div>
                    </div>

                    {filteredStudents.length === 0 ? (
                        <div className="py-20 text-center">
                            <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No students found matching your criteria</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Enrolled Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Progress</th>
                                        <th className="px-6 py-4 text-right">Paid Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={student.profilePicture}
                                                        firstName={student.name.split(' ')[0]}
                                                        lastName={student.name.split(' ')[1]}
                                                        size="md"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-500">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {new Date(student.enrolledAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {student.isPaid ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase">
                                                        <CheckCircle2 className="w-3 h-3" /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase">
                                                        <Clock className="w-3 h-3" /> Free
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-[100px]">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-slate-500">{student.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${student.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                                                }`}
                                                            style={{ width: `${student.progress || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                    {student.paidAmount ? `${student.paidAmount}€` : '0.00€'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, subValue, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/30',
        amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30',
    };

    return (
        <div className={`p-6 rounded-3xl border shadow-sm ${colorClasses[color]} transition-transform hover:scale-[1.02]`}>
            <div className="p-3 bg-white dark:bg-slate-900 w-fit rounded-2xl shadow-sm mb-4">
                {icon}
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{value}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">{subValue}</p>
            </div>
        </div>
    );
};

export default InstructorCourseStats;
