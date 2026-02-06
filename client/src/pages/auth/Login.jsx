import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// import { useAuth } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  // Redirect if already logged in (ROLE-BASED)
  useEffect(() => {
    if (loading || !user) return;

    switch (user.role) {
      case 'STUDENT':
        navigate('/student/dashboard', { replace: true });
        break;

      case 'INSTRUCTOR':
        navigate('/instructor/dashboard', { replace: true });
        break;

      case 'ADMIN':
        navigate('/admin/dashboard', { replace: true });
        break;

      default:
        navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(formData.email, formData.password);

    setIsSubmitting(false);

    // ❗ NO NAVIGATION HERE
    // Navigation happens ONLY via useEffect after user state updates
    if (!result.success) {
      setError(result.message || t('auth.errors.login_failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl dark:shadow-none border border-slate-100 dark:border-slate-800 p-10 transition-all duration-300 hover:shadow-indigo-200/20 dark:hover:border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('auth.login.title')}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
              {t('auth.login.subtitle')}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-4 border border-rose-100 dark:border-rose-900/50">
                <p className="text-sm text-rose-800 dark:text-rose-300 font-bold flex items-center gap-2">
                  <span>⚠️</span> {error}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('auth.login.email_label')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t('auth.login.password_label')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 rounded dark:bg-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-slate-600 dark:text-slate-400">
                  {t('auth.login.remember_me')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition">
                  {t('auth.login.forgot_password')}
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting || loading ? (
                <span className="flex items-center font-bold">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('auth.errors.initializing')}
                </span>
              ) : (
                t('auth.login.submit')
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold">{t('auth.login.new_user')}</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                {t('auth.login.create_account')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
