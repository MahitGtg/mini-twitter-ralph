"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useId, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = () => {
    if (isLoading) {
      return;
    }
    onClose();
  };

  const handleConfirm = () => {
    if (isLoading) {
      return;
    }
    onConfirm();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousActive = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTarget = isLoading
      ? cancelButtonRef.current ?? confirmButtonRef.current
      : confirmButtonRef.current ?? cancelButtonRef.current;
    focusTarget?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousActive?.focus();
    };
  }, [isOpen, isLoading]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement === cancelButtonRef.current) {
        handleClose();
        return;
      }
      handleConfirm();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current
      ? Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
        ).filter((element) => !element.hasAttribute("disabled"))
      : [];

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const confirmClasses =
    variant === "destructive"
      ? "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500"
      : "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="space-y-3">
          <h2
            id={titleId}
            className="text-lg font-semibold text-slate-900"
          >
            {title}
          </h2>
          <p id={messageId} className="text-sm text-slate-600">
            {message}
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ${confirmClasses}`}
          >
            {isLoading ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            ) : null}
            <span>{isLoading ? `${confirmLabel}...` : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
