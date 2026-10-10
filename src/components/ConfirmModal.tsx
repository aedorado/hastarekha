'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  autofocusButton?: 'confirm' | 'cancel';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  autofocusButton = 'cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus management, focus trap, and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Save the element that triggered the modal to restore focus on close
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Lock body scroll while dialog is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move initial focus to dialog or specified button
    const target = autofocusButton === 'confirm' ? confirmBtnRef.current : cancelBtnRef.current;
    const focusTimer = setTimeout(() => {
      if (target) {
        target.focus();
      } else if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }, 20);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      // Restore previous focus when modal closes
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onCancel, autofocusButton]);

  if (!isOpen) return null;

  const iconBg =
    variant === 'danger'
      ? 'bg-rose-100 text-rose-600'
      : variant === 'warning'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-stone-100 text-stone-700';

  const confirmBtnBg =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white'
      : 'bg-stone-900 hover:bg-stone-800 text-white';

  const IconComponent =
    variant === 'danger'
      ? AlertTriangle
      : variant === 'warning'
      ? AlertCircle
      : HelpCircle;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up outline-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 id="confirm-modal-title" className="font-serif font-bold text-lg text-stone-900 leading-snug">
              {title}
            </h3>
          </div>
        </div>

        <div id="confirm-modal-desc" className="text-sm text-stone-600 leading-relaxed">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-stone-100">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-stone-400 ${confirmBtnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
