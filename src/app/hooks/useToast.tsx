import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  msg: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastUI = toast ? (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all ${
        toast.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : toast.type === 'warning'
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle2 size={16} />
      ) : toast.type === 'warning' ? (
        <AlertTriangle size={16} />
      ) : (
        <XCircle size={16} />
      )}
      {toast.msg}
    </div>
  ) : null;

  return { showToast, ToastUI };
}
