import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, CheckCheck, Trash2, Home, BookOpen, GraduationCap, Award, MessageSquare, Heart, Settings } from 'lucide-react';
import Button from '../components/common/Button';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotifications();

  const getIcon = (type) => {
    const icons = {
      ENROLLMENT: <BookOpen className="w-5 h-5 text-blue-500" />,
      PAYMENT: <Award className="w-5 h-5 text-green-500" />,
      REVIEW: <MessageSquare className="w-5 h-5 text-yellow-500" />,
      DISCUSSION: <MessageSquare className="w-5 h-5 text-purple-500" />,
      CERTIFICATE: <GraduationCap className="w-5 h-5 text-indigo-500" />,
      COURSE_PUBLISHED: <BookOpen className="w-5 h-5 text-emerald-500" />,
      QUIZ_RESULT: <Award className="w-5 h-5 text-orange-500" />,
      WISHLIST_UPDATE: <Heart className="w-5 h-5 text-rose-500" />,
      SYSTEM: <Settings className="w-5 h-5 text-slate-500" />,
      OTHER: <Bell className="w-5 h-5 text-slate-400" />,
    };
    return icons[type] || <Bell className="w-5 h-5 text-slate-400" />;
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await removeNotification(notificationId);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // If it's an enrollment notification for an instructor, go to stats
    if (notification.type === 'ENROLLMENT' && user?.role === 'INSTRUCTOR' && notification.data?.courseId) {
      navigate(`/instructor/courses/${notification.data.courseId}/stats`);
      return;
    }

    if (notification.data?.courseId) {
      navigate(`/courses/${notification.data.courseId}`);
    } else if (notification.data?.redirect) {
      navigate(notification.data.redirect);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {t('notifications.title', 'Notifications')}
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {unreadCount} {t('notifications.unread', 'unread')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              Icon={CheckCheck}
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || notifications.length === 0}
            >
              {t('notifications.markAllRead', 'Mark all read')}
            </Button>

            <Button
              variant="ghost"
              size="md"
              Icon={Home}
              onClick={() => navigate('/')}
            >
              {t('common.home', 'Home')}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t('notifications.empty.title', 'No notifications')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('notifications.empty.description', "You're all caught up! New notifications will appear here.")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group ${!notification.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`text-sm font-semibold text-slate-900 dark:text-white ${!notification.isRead ? 'font-bold' : ''
                            }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                            {new Date(notification.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="p-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {!notification.isRead && (
                      <div className="flex-shrink-0 mt-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
