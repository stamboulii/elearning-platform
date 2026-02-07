/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Filter,
  BarChart3,
  Search,
  Settings,
  ShieldCheck,
  Tag,
  Star,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats(period);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback for demo if backend fails
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        newUsers: 0,
        newEnrollments: 0,
        newRevenue: 0,
        pendingReviews: 0,
        pendingCourses: 0,
        trends: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('admin.dashboard.overview')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.dashboard.management')}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="7d">{t('admin.dashboard.period.last_7_days')}</option>
                <option value="30d">{t('admin.dashboard.period.last_30_days')}</option>
                <option value="90d">{t('admin.dashboard.period.last_90_days')}</option>
                <option value="1y">{t('admin.dashboard.period.last_year')}</option>
              </select>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title={t('admin.dashboard.refresh_tooltip')}
            >
              <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title={t('admin.dashboard.stats.total_revenue')}
            value={`$${stats.totalRevenue.toLocaleString()}`}
            trend={`+$${stats.newRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
            link="/admin/transactions"
          />
          <StatCard
            title={t('admin.dashboard.stats.total_students')}
            value={stats.totalUsers.toLocaleString()}
            trend={`+${stats.newUsers} new`}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-50"
            borderColor="border-blue-100"
            link="/admin/users"
          />
          <StatCard
            title={t('admin.dashboard.stats.total_enrollments')}
            value={stats.totalEnrollments.toLocaleString()}
            trend={`+${stats.newEnrollments} new`}
            icon={<GraduationCap className="w-6 h-6 text-indigo-600" />}
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
            link="/admin/enrollments"
          />
          <StatCard
            title={t('admin.dashboard.stats.total_courses')}
            value={stats.totalCourses.toLocaleString()}
            trend={t('admin.dashboard.active_platform')}
            icon={<BookOpen className="w-6 h-6 text-purple-600" />}
            bgColor="bg-purple-50"
            borderColor="border-purple-100"
            link="/admin/courses"
          />
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('admin.dashboard.revenue_chart.title')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.dashboard.revenue_chart.subtitle')}</p>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                {t('admin.dashboard.attention.title')}
              </h3>
              <div className="space-y-4">
                <ActionCard
                  title={t('admin.dashboard.attention.pending_courses')}
                  count={stats.pendingCourses}
                  icon={<BookOpen className="w-5 h-5" />}
                  color="text-amber-600"
                  bg="bg-amber-50"
                  link="/admin/courses?status=draft"
                />
                <ActionCard
                  title={t('admin.dashboard.attention.pending_reviews')}
                  count={stats.pendingReviews}
                  icon={<Star className="w-5 h-5" />}
                  color="text-blue-600"
                  bg="bg-blue-50"
                  link="/admin/reviews?status=pending"
                />
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t('admin.dashboard.attention.unapproved_info')}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <QuickStat label="Conversion" value="4.2%" trend="+0.5%" />
              <QuickStat label="Avg. Order" value="$84" trend="-2%" />
            </div>
          </div>
        </div>

        {/* Navigation & Management Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('admin.dashboard.management_system')}</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">{t('admin.dashboard.explore_tools')}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <NavTool icon={<Users />} label={t('admin.dashboard.tools.users')} link="/admin/users" color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/30" />
            <NavTool icon={<BookOpen />} label={t('admin.dashboard.tools.courses')} link="/admin/courses" color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/30" />
            <NavTool icon={<Layers />} label={t('admin.dashboard.tools.categories')} link="/admin/categories" color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/30" />
            <NavTool icon={<DollarSign />} label={t('admin.dashboard.tools.payments')} link="/admin/transactions" color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/30" />
            <NavTool icon={<Tag />} label={t('admin.dashboard.tools.coupons')} link="/admin/coupons" color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-900/30" />
            <NavTool icon={<Settings />} label={t('admin.dashboard.tools.settings')} link="/settings" color="text-slate-600 dark:text-slate-400" bg="bg-slate-50 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Components
const StatCard = ({ title, value, trend, icon, bgColor, borderColor, link }) => (
  <Link
    to={link}
    className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border ${borderColor} dark:border-slate-800 shadow-sm hover:shadow-md transition-all group`}
  >
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
        {icon}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-end gap-3">
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {trend}
      </p>
    </div>
  </Link>
);

const ActionCard = ({ title, count, icon, color, bg, link }) => (
  <Link
    to={link}
    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className={`${bg} ${color} p-2.5 rounded-xl transition-colors`}>
        {icon}
      </div>
      <span className="font-bold text-slate-700 dark:text-slate-200">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-xs font-black ${count > 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
        {count}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
);

const NavTool = ({ icon, label, link, color, bg }) => (
  <Link
    to={link}
    className="flex flex-col items-center justify-center p-6 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group"
  >
    <div className={`${bg} ${color} p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</span>
  </Link>
);

const QuickStat = ({ label, value, trend }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-center justify-between">
      <span className="text-lg font-black text-slate-800 dark:text-white">{value}</span>
      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30'}`}>
        {trend}
      </span>
    </div>
  </div>
);

export default AdminDashboard;