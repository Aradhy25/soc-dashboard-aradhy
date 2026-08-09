import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ToastTone = 'info' | 'success' | 'error';

export type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toasts: ToastItem[];
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ toasts, pushToast, dismissToast }), [toasts, pushToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            onClick={() => dismissToast(toast.id)}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-[0_0_20px_rgba(0,0,0,0.35)] backdrop-blur-md ${
              toast.tone === 'success'
                ? 'border-[#00ff88]/40 bg-[#00ff88]/15 text-[#00ff88]'
                : toast.tone === 'error'
                  ? 'border-[#ff0055]/40 bg-[#ff0055]/15 text-[#ff0055]'
                  : 'border-[#00f0ff]/40 bg-[#00f0ff]/15 text-[#00f0ff]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function useOptionalToast() {
  return useContext(ToastContext);
}

export function usePreferencesSync(onChange: (prefs: import('./preferences').SocPreferences) => void) {
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<import('./preferences').SocPreferences>).detail;
      if (detail) onChange(detail);
    };
    window.addEventListener('soc:preferences', handler as EventListener);
    return () => window.removeEventListener('soc:preferences', handler as EventListener);
  }, [onChange]);
}
