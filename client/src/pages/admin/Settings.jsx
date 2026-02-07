import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  Monitor,
  Bell,
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Key,
  AlertCircle,
  Check,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import toast from '../../utils/toast';

const UserSettings = () => {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme: setGlobalTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('security');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync selected theme when global theme changes (e.g. from other tabs)
  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const sections = [
    {
      id: 'security',
      label: t('admin.settings.security.title'),
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      id: 'appearance',
      label: t('admin.settings.appearance.title'),
      icon: <Moon className="w-5 h-5" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    }
  ];

  const themeOptions = [
    {
      value: 'light',
      label: t('admin.settings.appearance.light_mode.label'),
      icon: <Sun className="w-5 h-5" />,
      description: t('admin.settings.appearance.light_mode.description')
    },
    {
      value: 'dark',
      label: t('admin.settings.appearance.dark_mode.label'),
      icon: <Moon className="w-5 h-5" />,
      description: t('admin.settings.appearance.dark_mode.description')
    },
    {
      value: 'system',
      label: t('admin.settings.appearance.system_default.label'),
      icon: <Monitor className="w-5 h-5" />,
      description: t('admin.settings.appearance.system_default.description')
    }
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      toast.error(t('admin.settings.error.password_mismatch'));
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        oldPassword,
        password: newPassword
      });

      if (res.status === 200) {
        toast.success(t('admin.settings.success.password_updated'));
        e.target.reset();
      } else {
        toast.error(res.data.message || t('admin.settings.error.update_failed'));
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(t('admin.settings.error.current_wrong'));
      } else {
        console.error(error);
        toast.error(t('admin.settings.error.update_failed'));
      }
    }
  };

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme);
    setGlobalTheme(theme);
    toast.custom(t('admin.settings.success.theme_updated', { theme: t(`admin.settings.appearance.${theme}_mode.label`) }), 'success', {
      duration: 2000,
      icon: '🎨',
    });
  };

  // Helper to determine if preview should show dark mode
  const isPreviewDark = () => {
    if (selectedTheme === 'dark') return true;
    if (selectedTheme === 'light') return false;
    // system
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-slate-900 dark:bg-indigo-600 rounded-2xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('admin.settings.title')}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('admin.settings.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${activeSection === section.id
                      ? `${section.bg} ${section.border} border shadow-sm`
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                  >
                    <div className={`${activeSection === section.id ? section.color : 'text-slate-400'} transition-colors`}>
                      {section.icon}
                    </div>
                    <span className={`font-bold text-sm ${activeSection === section.id ? 'text-slate-900 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                      {section.label}
                    </span>
                    {activeSection === section.id && (
                      <ChevronRight className={`w-4 h-4 ml-auto ${section.color}`} />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                {/* Change Password Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
                      <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('admin.settings.security.change_password')}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.settings.security.subtitle')}</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t('admin.settings.security.current_password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="oldPassword"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder={t('admin.settings.security.placeholder_current')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t('admin.settings.security.new_password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder={t('admin.settings.security.placeholder_new')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t('admin.settings.security.confirm_password')}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder={t('admin.settings.security.placeholder_confirm')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <p className="font-bold">{t('admin.settings.security.requirements.title')}</p>
                          <ul className="space-y-0.5 ml-4 list-disc">
                            <li>{t('admin.settings.security.requirements.chars_8')}</li>
                            <li>{t('admin.settings.security.requirements.uppercase')}</li>
                            <li>{t('admin.settings.security.requirements.lowercase')}</li>
                            <li>{t('admin.settings.security.requirements.number')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      {t('admin.settings.security.update_password')}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                {/* Theme Selection Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                      <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('admin.settings.appearance.display_mode')}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.settings.appearance.subtitle')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleThemeSelection(option.value)}
                        className={`relative p-6 rounded-2xl border-2 transition-all text-left ${selectedTheme === option.value
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                          }`}
                      >
                        {selectedTheme === option.value && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div className={`mb-4 ${selectedTheme === option.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                          {option.icon}
                        </div>
                        <h3 className={`font-bold mb-1 ${selectedTheme === option.value ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-white'}`}>{option.label}</h3>
                        <p className={`text-xs ${selectedTheme === option.value ? 'text-indigo-600/80 dark:text-indigo-300/80' : 'text-slate-500 dark:text-slate-400'}`}>{option.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleThemeSelection(selectedTheme)}
                      disabled={selectedTheme === currentTheme}
                      className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${selectedTheme === currentTheme
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:-translate-y-0.5'
                        }`}
                    >
                      {t('admin.settings.appearance.apply_theme')}
                    </button>
                  </div>
                </div>

                {/* Preview Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('admin.settings.appearance.preview.title')}</h3>

                  {/* Preview Container - Changes based on selected Theme immediately */}
                  <div className={`rounded-2xl p-6 border transition-colors duration-300 ${isPreviewDark()
                    ? 'bg-slate-900 border-slate-700'
                    : 'bg-slate-50 border-slate-200'
                    }`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full ${isPreviewDark() ? 'bg-indigo-900' : 'bg-indigo-100'
                        }`}></div>
                      <div className="flex-1">
                        <div className={`h-3 rounded w-32 mb-2 ${isPreviewDark() ? 'bg-slate-700' : 'bg-slate-300'
                          }`}></div>
                        <div className={`h-2 rounded w-48 ${isPreviewDark() ? 'bg-slate-800' : 'bg-slate-200'
                          }`}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className={`h-2 rounded ${isPreviewDark() ? 'bg-slate-800' : 'bg-slate-200'
                        }`}></div>
                      <div className={`h-2 rounded w-5/6 ${isPreviewDark() ? 'bg-slate-800' : 'bg-slate-200'
                        }`}></div>
                      <div className={`h-2 rounded w-4/6 ${isPreviewDark() ? 'bg-slate-800' : 'bg-slate-200'
                        }`}></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 italic">
                    {t('admin.settings.appearance.preview.description')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
