import { Toaster } from 'react-hot-toast';

/**
 * ToastProvider Component
 * Wraps the app with toast notification support
 */
export default function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e2430',
            color: '#e4e7eb',
            border: '1px solid #2a3140',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#9CA3AF',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

/**
 * Toast helper functions
 */
import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  dismiss: (toastId) => toast.dismiss(toastId),
  promise: (promise, messages) => toast.promise(promise, messages),
};
