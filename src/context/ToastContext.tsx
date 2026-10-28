import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'warning' | 'error' | 'success' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title: string;
  titleTamil?: string;
  message: string;
  messageTamil?: string;
  details?: string;
  duration?: number; // In ms, default 5000ms
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  duration: number;
  timestamp: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options.duration ?? 5000;
    const newToast: ToastItem = {
      ...options,
      id,
      type: options.type || 'info',
      duration,
      timestamp: Date.now(),
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep latest 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container & Render Component
interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map(toast => {
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        let borderClass = 'border-blue-200 bg-white text-slate-900';
        let iconBg = 'bg-blue-100 text-blue-700';
        let barColor = 'bg-blue-600';
        let IconComponent = Info;

        if (isError) {
          borderClass = 'border-rose-300 bg-rose-50/95 text-rose-950 shadow-rose-100';
          iconBg = 'bg-rose-100 text-rose-700 border border-rose-200';
          barColor = 'bg-rose-600';
          IconComponent = AlertCircle;
        } else if (isWarning) {
          borderClass = 'border-amber-300 bg-amber-50/95 text-amber-950 shadow-amber-100';
          iconBg = 'bg-amber-100 text-amber-800 border border-amber-200';
          barColor = 'bg-amber-600';
          IconComponent = AlertTriangle;
        } else if (isSuccess) {
          borderClass = 'border-emerald-300 bg-emerald-50/95 text-emerald-950 shadow-emerald-100';
          iconBg = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
          barColor = 'bg-emerald-600';
          IconComponent = CheckCircle2;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full rounded-xl border p-4 shadow-lg backdrop-blur-xs transition-all duration-300 transform translate-y-0 opacity-100 overflow-hidden relative ${borderClass}`}
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${barColor}`} />

            <div className="flex items-start gap-3 mt-0.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <div className="flex flex-col">
                  <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                    {toast.titleTamil && toast.title ? (
                      <span className="flex flex-col">
                        <span>{toast.titleTamil}</span>
                        <span className="text-[11px] font-medium opacity-80">{toast.title}</span>
                      </span>
                    ) : (
                      toast.title
                    )}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">
                    {toast.messageTamil && toast.message ? (
                      <span>
                        <span>{toast.messageTamil}</span>
                        <span className="block text-[11px] opacity-80 mt-0.5">{toast.message}</span>
                      </span>
                    ) : (
                      toast.message
                    )}
                  </p>
                  {toast.details && (
                    <div className="mt-2 text-[10px] font-mono bg-white/70 px-2 py-1 rounded border border-black/5 text-slate-700 break-words">
                      {toast.details}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-700 rounded-lg p-1 transition-colors hover:bg-black/5 -mr-1 -mt-1"
                aria-label="Dismiss toast notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
