"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import ToastContainer from "@/components/ui/ToastContainer";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  isLeaving?: boolean;
};

type ToastInput = {
  type: ToastType;
  message: string;
  duration?: number;
};

export type ToastContextValue = {
  toasts: ToastItem[];
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;
const DEFAULT_MAX_TOASTS = 3;
const EXIT_DURATION = 200;

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast_${Math.random().toString(36).slice(2, 10)}`;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutMap = useRef(new Map<string, number>());
  const exitTimeoutMap = useRef(new Map<string, number>());

  useEffect(() => {
    return () => {
      timeoutMap.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      exitTimeoutMap.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutMap.current.clear();
      exitTimeoutMap.current.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const autoTimeout = timeoutMap.current.get(id);
    if (autoTimeout) {
      window.clearTimeout(autoTimeout);
      timeoutMap.current.delete(id);
    }

    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id && !toast.isLeaving ? { ...toast, isLeaving: true } : toast,
      ),
    );

    const exitTimeout = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      exitTimeoutMap.current.delete(id);
    }, EXIT_DURATION);
    exitTimeoutMap.current.set(id, exitTimeout);
  }, []);

  const showToast = useCallback(
    ({ type, message, duration = DEFAULT_DURATION }: ToastInput) => {
      const id = generateId();
      const nextToast: ToastItem = { id, type, message, duration };
      setToasts((prev) => {
        const next = [nextToast, ...prev];
        const trimmed = next.slice(0, DEFAULT_MAX_TOASTS);
        const removed = next.slice(DEFAULT_MAX_TOASTS);
        removed.forEach((toast) => {
          const autoTimeout = timeoutMap.current.get(toast.id);
          if (autoTimeout) {
            window.clearTimeout(autoTimeout);
            timeoutMap.current.delete(toast.id);
          }
          const exitTimeout = exitTimeoutMap.current.get(toast.id);
          if (exitTimeout) {
            window.clearTimeout(exitTimeout);
            exitTimeoutMap.current.delete(toast.id);
          }
        });
        return trimmed;
      });

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, duration);
      timeoutMap.current.set(id, timeoutId);

      return id;
    },
    [dismissToast],
  );

  const clearToasts = useCallback(() => {
    timeoutMap.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    exitTimeoutMap.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutMap.current.clear();
    exitTimeoutMap.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      clearToasts,
    }),
    [toasts, showToast, dismissToast, clearToasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export { ToastContext };
