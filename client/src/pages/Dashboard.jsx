import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'INSTRUCTOR':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'STUDENT':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3"></div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">E-Learning Platform</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p className="text-indigo-100">
              Ready to continue your learning journey?
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">My Courses</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Hours Learned</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">0h</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6 border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="text-sm text-slate-500 dark:text-slate-500">Email</p>
                <p className="text-slate-900 dark:text-slate-200 font-medium">{user?.email}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="text-slate-900 dark:text-slate-200 font-medium">
                  {user?.emailVerified ? (
                    <span className="text-emerald-600 dark:text-emerald-500 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Not Verified
                    </span>
                  )}
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-slate-500 dark:text-slate-500">Member Since</p>
                <p className="text-slate-900 dark:text-slate-200 font-medium">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="text-sm text-slate-500 dark:text-slate-500">User ID</p>
                <p className="text-slate-900 dark:text-slate-200 font-mono text-xs">{user?.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all group">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3 group-hover:bg-indigo-500 transition-colors">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Browse Courses</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Discover new learning opportunities</p>
                  </div>
                </div>
              </button>

              <button className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md transition-all group">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 group-hover:bg-emerald-500 transition-colors">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">My Profile</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Update your account settings</p>
                  </div>
                </div>
              </button>

              <button className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-md transition-all group">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 group-hover:bg-purple-500 transition-colors">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4 text-left">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">My Progress</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Track your learning journey</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;