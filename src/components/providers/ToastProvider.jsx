"use client";

/**
 * Toast provider component
 * Wrap your app with this to enable toast notifications
 * 
 * Usage in layout:
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 */
export default function ToastProvider({ children }) {
  let Toaster = null;
  
  // Try to import react-hot-toast, fallback gracefully if not installed
  try {
    const hotToast = require("react-hot-toast");
    Toaster = hotToast.Toaster;
  } catch (e) {
    // Package not installed yet, provider will work but toasts will use console fallback
    console.warn("react-hot-toast not installed. Toast notifications will use console fallback.");
  }

  return (
    <>
      {children}
      {Toaster && (
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1e293b",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              padding: "16px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      )}
    </>
  );
}

