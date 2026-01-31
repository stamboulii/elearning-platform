/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h1>
            <p className="text-slate-500 mt-1">Management dashboard and real-time analytics.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <Clock className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            trend={`+$${stats.newRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
            bgColor="bg-emerald-50"
            borderColor="border-emerald-100"
            link="/admin/transactions"
          />
          <StatCard
            title="Total Students"
            value={stats.totalUsers.toLocaleString()}
            trend={`+${stats.newUsers} new`}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            bgColor="bg-blue-50"
            borderColor="border-blue-100"
            link="/admin/users"
          />
          <StatCard
            title="Total Enrollments"
            value={stats.totalEnrollments.toLocaleString()}
            trend={`+${stats.newEnrollments} new`}
            icon={<GraduationCap className="w-6 h-6 text-indigo-600" />}
            bgColor="bg-indigo-50"
            borderColor="border-indigo-100"
            link="/admin/enrollments"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses.toLocaleString()}
            trend="Active platform"
            icon={<BookOpen className="w-6 h-6 text-purple-600" />}
            bgColor="bg-purple-50"
            borderColor="border-purple-100"
            link="/admin/courses"
          />
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Revenue Performance</h3>
                <p className="text-sm text-slate-500">Monthly revenue trends for the last 6 months</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Attention Required
              </h3>
              <div className="space-y-4">
                <ActionCard
                  title="Pending Course Approvals"
                  count={stats.pendingCourses}
                  icon={<BookOpen className="w-5 h-5" />}
                  color="text-amber-600"
                  bg="bg-amber-50"
                  link="/admin/courses?status=draft"
                />
                <ActionCard
                  title="New Reviews to Verify"
                  count={stats.pendingReviews}
                  icon={<Star className="w-5 h-5" />}
                  color="text-blue-600"
                  bg="bg-blue-50"
                  link="/admin/reviews?status=pending"
                />
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 italic">Unapproved items are not visible to students.</p>
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
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">System Management</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1 rounded-full">Explore tools</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <NavTool icon={<Users />} label="Users" link="/admin/users" color="text-blue-600" bg="bg-blue-50" />
            <NavTool icon={<BookOpen />} label="Courses" link="/admin/courses" color="text-purple-600" bg="bg-purple-50" />
            <NavTool icon={<Layers />} label="Categories" link="/admin/categories" color="text-indigo-600" bg="bg-indigo-50" />
            <NavTool icon={<DollarSign />} label="Payments" link="/admin/transactions" color="text-emerald-600" bg="bg-emerald-50" />
            <NavTool icon={<Tag />} label="Coupons" link="/admin/coupons" color="text-rose-600" bg="bg-rose-50" />
            <NavTool icon={<Settings />} label="Settings" link="/admin/settings" color="text-slate-600" bg="bg-slate-50" />
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
    className={`bg-white rounded-3xl p-6 border ${borderColor} shadow-sm hover:shadow-md transition-all group`}
  >
    <div className="flex items-center justify-between mb-6">
      <div className={`${bgColor} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
    </div>
    <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-end gap-3">
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-bold text-emerald-600 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {trend}
      </p>
    </div>
  </Link>
);

const ActionCard = ({ title, count, icon, color, bg, link }) => (
  <Link
    to={link}
    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className={`${bg} ${color} p-2.5 rounded-xl`}>
        {icon}
      </div>
      <span className="font-bold text-slate-700">{title}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-xs font-black ${count > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
);

const NavTool = ({ icon, label, link, color, bg }) => (
  <Link
    to={link}
    className="flex flex-col items-center justify-center p-6 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all group"
  >
    <div className={`${bg} ${color} p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-600">{label}</span>
  </Link>
);

const QuickStat = ({ label, value, trend }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-center justify-between">
      <span className="text-lg font-black text-slate-800">{value}</span>
      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
        {trend}
      </span>
    </div>
  </div>
);

export default AdminDashboard;