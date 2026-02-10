"use client";

import { useContext, useMemo } from "react";
import { ToastContext } from "@/contexts/ToastContext";

type ToastOptions = {
  duration?: number;
};

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  const toast = useMemo(
    () => ({
      success: (message: string, options?: ToastOptions) =>
        context.showToast({ type: "success", message, duration: options?.duration }),
      error: (message: string, options?: ToastOptions) =>
        context.showToast({ type: "error", message, duration: options?.duration }),
      info: (message: string, options?: ToastOptions) =>
        context.showToast({ type: "info", message, duration: options?.duration }),
      warning: (message: string, options?: ToastOptions) =>
        context.showToast({ type: "warning", message, duration: options?.duration }),
    }),
    [context],
  );

  return {
    ...context,
    toast,
  };
}
