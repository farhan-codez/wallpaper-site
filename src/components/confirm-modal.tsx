"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      className="backdrop:bg-black/60 bg-transparent p-0 m-0 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="bg-card border border-border rounded-2xl p-5 w-[calc(100vw-3rem)] max-w-xs shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold">{title}</h3>
        </div>

        <p className="text-muted text-sm mb-5 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-card transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 ${
              danger ? "bg-red-600" : "bg-foreground"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
