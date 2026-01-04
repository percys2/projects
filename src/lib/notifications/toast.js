/**
 * Toast notification utility
 * Provides a consistent API for showing notifications throughout the app
 * 
 * Usage:
 * import { toast } from '@/src/lib/notifications/toast';
 * toast.success('Operación exitosa');
 * toast.error('Error al guardar');
 */

// Fallback implementation using react-hot-toast
// If react-hot-toast is not installed, this will use a simple console fallback
let toastInstance = null;

// Try to import react-hot-toast
try {
  const hotToast = require('react-hot-toast');
  toastInstance = hotToast.toast;
} catch (e) {
  // Fallback for when react-hot-toast is not installed
  console.warn('react-hot-toast not installed. Using console fallback.');
}

const createToast = (type, message, options = {}) => {
  if (toastInstance) {
    const toastOptions = {
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options,
    };

    switch (type) {
      case 'success':
        return toastInstance.success(message, toastOptions);
      case 'error':
        return toastInstance.error(message, toastOptions);
      case 'info':
        return toastInstance(message, { ...toastOptions, icon: 'ℹ️' });
      case 'warning':
        return toastInstance(message, { ...toastOptions, icon: '⚠️' });
      default:
        return toastInstance(message, toastOptions);
    }
  } else {
    // Console fallback
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '⚠️';
    console.log(`${prefix} ${message}`);
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message);
    }
  }
};

export const toast = {
  success: (message, options) => createToast('success', message, options),
  error: (message, options) => createToast('error', message, options),
  info: (message, options) => createToast('info', message, options),
  warning: (message, options) => createToast('warning', message, options),
  loading: (message, options) => {
    if (toastInstance) {
      return toastInstance.loading(message, options);
    } else {
      console.log(`⏳ ${message}`);
    }
  },
  dismiss: (toastId) => {
    if (toastInstance && toastId) {
      toastInstance.dismiss(toastId);
    }
  },
  promise: (promise, messages) => {
    if (toastInstance) {
      return toastInstance.promise(promise, messages);
    } else {
      return promise;
    }
  },
};

