import toast from 'react-hot-toast';

export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    style: {
      borderRadius: '10px',
      background: '#f0fdf4',
      color: '#16a34a',
      border: '1px solid #bbf7d0',
      fontSize: '14px',
    },
    icon: '✅',
    ...options,
  });
};

export const showError = (message, options = {}) => {
  return toast.error(message, {
    duration: 5000,
    style: {
      borderRadius: '10px',
      background: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      fontSize: '14px',
    },
    icon: '❌',
    ...options,
  });
};

export const showWarning = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    style: {
      borderRadius: '10px',
      background: '#fffbeb',
      color: '#d97706',
      border: '1px solid #fde68a',
      fontSize: '14px',
    },
    icon: '⚠️',
    ...options,
  });
};

export const showInfo = (message, options = {}) => {
  return toast(message, {
    duration: 3000,
    style: {
      borderRadius: '10px',
      background: '#f0f9ff',
      color: '#0369a1',
      border: '1px solid #bae6fd',
      fontSize: '14px',
    },
    icon: 'ℹ️',
    ...options,
  });
};

export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.loading(message, {
    style: {
      borderRadius: '10px',
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #cbd5e1',
      fontSize: '14px',
    },
    ...options,
  });
};

export const showCustom = (message, type = 'default', options = {}) => {
  const themes = {
    success: {
      style: {
        background: '#f0fdf4',
        color: '#16a34a',
        border: '1px solid #bbf7d0',
      },
      icon: '✅'
    },
    error: {
      style: {
        background: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
      },
      icon: '❌'
    },
    warning: {
      style: {
        background: '#fffbeb',
        color: '#d97706',
        border: '1px solid #fde68a',
      },
      icon: '⚠️'
    },
    info: {
      style: {
        background: '#f0f9ff',
        color: '#0369a1',
        border: '1px solid #bae6fd',
      },
      icon: 'ℹ️'
    },
    default: {
      style: {
        background: '#fff',
        color: '#374151',
        border: '1px solid #e5e7eb',
      },
      icon: '💬'
    }
  };

  const theme = themes[type] || themes.default;
  
  return toast(message, {
    duration: type === 'error' ? 5000 : 4000,
    style: {
      borderRadius: '10px',
      fontSize: '14px',
      ...theme.style,
    },
    icon: theme.icon,
    ...options,
  });
};

// Dismiss toast by ID
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  custom: showCustom,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
};