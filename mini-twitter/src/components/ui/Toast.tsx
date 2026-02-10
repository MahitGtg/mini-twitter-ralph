"use client";

import { useEffect, useState } from "react";
import type { ToastItem, ToastType } from "@/contexts/ToastContext";

type ToastProps = {
  toast: ToastItem;
  onDismiss: (id: string) => void;
};

const typeStyles: Record<
  ToastType,
  { container: string; icon: string; label: string; progress: string }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: "text-emerald-600 bg-emerald-100",
    label: "Success",
    progress: "bg-emerald-400/60",
  },
  error: {
    container: "border-rose-200 bg-rose-50 text-rose-800",
    icon: "text-rose-600 bg-rose-100",
    label: "Error",
    progress: "bg-rose-400/60",
  },
  info: {
    container: "border-sky-200 bg-sky-50 text-sky-800",
    icon: "text-sky-600 bg-sky-100",
    label: "Info",
    progress: "bg-sky-400/60",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-800",
    icon: "text-amber-600 bg-amber-100",
    label: "Warning",
    progress: "bg-amber-400/60",
  },
};

const iconPaths: Record<ToastType, string> = {
  success: "M9 12.75 11.25 15 15 9.75",
  error: "M12 9v3.75M12 15.75h.01",
  info: "M12 9.75h.01M11.25 12.75h1.5v3.75",
  warning: "M12 9v3.75M12 15.75h.01",
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = typeStyles[toast.type];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleDismiss = () => {
    if (!toast.isLeaving) {
      onDismiss(toast.id);
    }
  };

  return (
    <div
      role="status"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      className={`relative overflow-hidden rounded-xl border px-4 py-3 shadow-lg transition duration-200 ease-out ${
        styles.container
      } ${toast.isLeaving || !isVisible ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100"}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${styles.icon}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d={iconPaths[toast.type]} />
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {styles.label}
          </p>
          <p className="text-sm text-current opacity-90">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className={`toast-progress h-full origin-left ${styles.progress}`}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
}
