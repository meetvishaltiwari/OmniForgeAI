import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertCircle, X, CheckCircle2, Info } from 'lucide-react';

type ToastType = 'quota' | 'error' | 'success' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  showQuotaError: (message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  showQuotaError: () => {}
});

export const useToast = () => useContext(ToastContext);

// Helper: check if a fetch response/data indicates quota exceeded
export const isQuotaError = (data: any, status?: number): boolean => {
  if (status === 429) return true;
  if (data?.quotaExceeded) return true;
  if (typeof data?.error === 'string' && data.error.includes('429')) return true;
  return false;
};

// Utility to safely call toast from any API response
export const handleApiResponse = (
  data: any,
  status: number,
  showToast: (msg: string, type?: ToastType) => void,
  showQuotaError: (msg?: string) => void
) => {
  if (isQuotaError(data, status)) {
    showQuotaError(data?.error);
    return false;
  }
  if (!data || data.error) {
    showToast(data?.error || 'Something went wrong. Please try again.', 'error');
    return false;
  }
  return true;
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 8000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; title: string }> = {
    quota: {
      bg: 'bg-gray-950',
      border: 'border-amber-800/50',
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      title: 'AI Quota Exceeded'
    },
    error: {
      bg: 'bg-gray-950',
      border: 'border-red-800/50',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />,
      title: 'Error'
    },
    success: {
      bg: 'bg-gray-950',
      border: 'border-emerald-800/50',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      title: 'Success'
    },
    info: {
      bg: 'bg-gray-950',
      border: 'border-blue-800/50',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />,
      title: 'Info'
    }
  };

  const c = config[toast.type];

  return (
    <div className={`${c.bg} text-white rounded-2xl shadow-2xl border ${c.border} p-5 flex gap-4 items-start min-w-[320px] max-w-sm`}
      style={{ animation: 'slideInUp 0.3s ease-out' }}>
      {c.icon}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white mb-1">{c.title}</p>
        <p className="text-xs text-gray-400 leading-relaxed break-words">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-gray-600 hover:text-gray-300 transition shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + counter++;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const showQuotaError = useCallback((message?: string) => {
    showToast(
      message || 'Your free-tier AI quota has been reached. Please wait a few minutes and try again.',
      'quota'
    );
  }, [showToast]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showQuotaError }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
