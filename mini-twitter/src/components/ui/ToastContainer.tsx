"use client";

import { useContext } from "react";
import Toast from "@/components/ui/Toast";
import { ToastContext } from "@/contexts/ToastContext";

export default function ToastContainer() {
  const context = useContext(ToastContext);

  if (!context) {
    return null;
  }

  const { toasts, dismissToast } = context;

  if (!toasts.length) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions text"
      className="fixed bottom-4 right-4 z-50 flex w-[min(320px,calc(100vw-2rem))] flex-col gap-3"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
