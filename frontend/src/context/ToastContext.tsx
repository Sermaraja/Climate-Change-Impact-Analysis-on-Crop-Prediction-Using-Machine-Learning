import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastOptions {
  id?: string;
  type?: 'success' | 'info' | 'warning';
  message: string;
  secondaryMessage?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number; // ms
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const showToast = (options: ToastOptions) => {
    const id = options.id || Math.random().toString(36).substring(2, 9);
    const newToast = { ...options, id };
    setToasts((prev) => [...prev.filter((t) => t.id !== id), newToast]);

    const duration = options.duration ?? 6000;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 max-w-md w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-slate-800 flex items-start space-x-3 transition-all transform translate-y-0 opacity-100"
          >
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <h5 className="text-sm font-bold text-white">{toast.message}</h5>
              {toast.secondaryMessage && (
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.secondaryMessage}</p>
              )}

              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    if (toast.id) dismissToast(toast.id);
                  }}
                  className="mt-2.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-md text-xs shadow-xs transition-colors"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>

            <button
              onClick={() => toast.id && dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
