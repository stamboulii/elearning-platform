import { useState } from 'react';
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

// import authService from '../../services/authService';
import api from '../../services/api';
import toast from '../../utils/toast';

const UserSettings = () => {
    const [activeSection, setActiveSection] = useState('security');
    const [theme, setTheme] = useState('light');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sections = [
    {
      id: 'security',
      label: 'Security',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Moon className="w-5 h-5" />,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    }
  ];

  const themeOptions = [
    {
      value: 'light',
      label: 'Light Mode',
      icon: <Sun className="w-5 h-5" />,
      description: 'Clean and bright interface'
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      icon: <Moon className="w-5 h-5" />,
      description: 'Easy on the eyes at night'
    },
    {
      value: 'system',
      label: 'System Default',
      icon: <Monitor className="w-5 h-5" />,
      description: 'Follows your device settings'
    }
  ];

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        console.log('Form submitted'); 

        const oldPassword = e.target.oldPassword.value;
        const newPassword = e.target.newPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation do not match');
            return;
        }

        try {
            const res = await api.put('/auth/change-password', {
                oldPassword,
                password: newPassword
            });

            if (res.status === 200) {
                toast.success('Password updated successfully!');
                e.target.reset();
            } else {
                toast.error(res.data.message || 'Failed to update password');
            }
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Current password is incorrect!');
            } else {
                console.error(error);
                toast.error('Something went wrong. Please try again.');
            }
        }
    };
    const handleThemeChange = (selectedTheme) => {
        setTheme(selectedTheme);
        toast.custom(`Theme changed to ${selectedTheme} mode`, 'success', {
        duration: 3000,
        icon: '🎨',
        });
    };
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-slate-900 rounded-2xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-500 mt-1">Manage your account preferences and security</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 sticky top-8">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                      activeSection === section.id
                        ? `${section.bg} ${section.border} border shadow-sm`
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`${activeSection === section.id ? section.color : 'text-slate-400'} transition-colors`}>
                      {section.icon}
                    </div>
                    <span className={`font-bold text-sm ${
                      activeSection === section.id ? 'text-slate-900' : 'text-slate-600'
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
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-50 rounded-2xl">
                      <Lock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
                      <p className="text-sm text-slate-500">Update your password to keep your account secure</p>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="oldPassword"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="Enter current password"
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
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="Enter new password"
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
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="Confirm new password"
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
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-700 space-y-1">
                          <p className="font-bold">Password must contain:</p>
                          <ul className="space-y-0.5 ml-4 list-disc">
                            <li>At least 8 characters</li>
                            <li>One uppercase letter</li>
                            <li>One lowercase letter</li>
                            <li>One number</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                {/* Theme Selection Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Moon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Display Mode</h2>
                      <p className="text-sm text-slate-500">Choose how the interface looks</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value)}
                        className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                          theme === option.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {theme === option.value && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div className={`mb-4 ${theme === option.value ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {option.icon}
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{option.label}</h3>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Preview</h3>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-slate-300 rounded w-32 mb-2"></div>
                        <div className="h-2 bg-slate-200 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 rounded"></div>
                      <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 italic">
                    This is how your interface will appear with the selected theme
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