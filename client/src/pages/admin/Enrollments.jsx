import { useState, useEffect } from 'react';
import {
    GraduationCap, Search, Filter, RefreshCw,
    Calendar, CheckCircle, Clock,
    ArrowRight, Users, BookOpen, FileText,
    ChevronDown, ChevronUp, X, Trash2
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from '../../utils/toast';

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: filterStatus !== 'all' ? filterStatus : undefined
            };

            const response = await adminService.getAllEnrollments(params);
            setEnrollments(response.data.enrollments);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            toast.error('Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, [currentPage, filterStatus, searchTerm]);

    const handleRevokeEnrollment = async (enrollmentId) => {
        if (!window.confirm('Are you sure you want to revoke this enrollment? This will remove the student\'s access to the course.')) {
            return;
        }

        try {
            await adminService.revokeEnrollment(enrollmentId);
            toast.success('Enrollment revoked successfully');
            fetchEnrollments();
        } catch (error) {
            console.error('Error revoking enrollment:', error);
            toast.error('Failed to revoke enrollment');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const isCompleted = status === 'COMPLETED';
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Enrollment Management</h1>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor student access and course progress across the platform</p>
                        </div>
                        <button
                            onClick={fetchEnrollments}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by student name, email, or course title..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Completion Status
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-slate-500 dark:text-slate-400">Loading enrollments...</p>
                        </div>
                    ) : enrollments.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No enrollments found</h3>
                            <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Student</th>
                                            <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Course</th>
                                            <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Progress</th>
                                            <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Enrolled Date</th>
                                            <th className="text-left p-4 text-xs font-bold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {enrollments.map((enrollment) => (
                                            <tr
                                                key={enrollment.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                            {enrollment.user?.firstName?.charAt(0) || 'S'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white">
                                                                {enrollment.user?.firstName} {enrollment.user?.lastName}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {enrollment.user?.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="max-w-xs">
                                                        <div className="font-bold text-slate-900 dark:text-white truncate">
                                                            {enrollment.course?.title}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            by {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 w-32">
                                                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                                                            <span>PROGRESS</span>
                                                            <span>{enrollment.progressPercentage}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${enrollment.progressPercentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(enrollment.completionStatus)}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {formatDate(enrollment.enrolledAt)}
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleRevokeEnrollment(enrollment.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                                        title="Revoke Enrollment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Showing Page <span className="text-slate-900 dark:text-white">{currentPage}</span> of <span className="text-slate-900 dark:text-white">{totalPages}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-bold text-sm"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-indigo-200 dark:shadow-none font-bold text-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Enrollments;
