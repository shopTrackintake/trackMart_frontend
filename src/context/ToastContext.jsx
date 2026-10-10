import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback({
    success: (message, title = "Success") => addToast({ type: "success", title, message }),
    error: (message, title = "Error") => addToast({ type: "error", title, message }),
    info: (message, title = "Notice") => addToast({ type: "info", title, message }),
    warning: (message, title = "Warning") => addToast({ type: "warning", title, message }),
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}

      {/* FLOATING TOAST CONTAINER */}
      <div 
        aria-live="polite"
        className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all duration-300 transform translate-y-0 backdrop-blur-md animate-slideDown ${
                isSuccess
                  ? "bg-white/95 border-emerald-200 text-slate-800 shadow-emerald-500/10"
                  : isError
                  ? "bg-white/95 border-red-200 text-slate-800 shadow-red-500/10"
                  : isWarning
                  ? "bg-white/95 border-amber-200 text-slate-800 shadow-amber-500/10"
                  : "bg-white/95 border-blue-200 text-slate-800 shadow-blue-500/10"
              }`}
            >
              {/* ICON */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSuccess
                    ? "bg-emerald-100 text-emerald-600"
                    : isError
                    ? "bg-red-100 text-red-600"
                    : isWarning
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />}
                {isError && <AlertCircle className="w-5 h-5 stroke-[2.2]" />}
                {isWarning && <AlertTriangle className="w-5 h-5 stroke-[2.2]" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 stroke-[2.2]" />}
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0 pt-0.5">
                {t.title && (
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-slate-600 leading-relaxed font-medium break-words">
                  {t.message}
                </p>
              </div>

              {/* DISMISS BUTTON */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition active:scale-90 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
