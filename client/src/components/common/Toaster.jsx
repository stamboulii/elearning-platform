import { Toaster } from 'react-hot-toast';

const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{
        top: 80,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          maxWidth: '400px',
          fontSize: '14px',
          fontWeight: 500,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#059669',
            border: '1px solid #a7f3d0',
          },
          iconTheme: {
            primary: '#059669',
            secondary: '#f0fdf4',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
          },
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fef2f2',
          },
        },
        loading: {
          style: {
            background: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
          },
        },
      }}
    />
  );
};

export default CustomToaster;