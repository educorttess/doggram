"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({ open, onClose, title, children, maxWidth = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-doggram-brown-dark/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          "relative z-10 w-full bg-doggram-warm-white rounded-3xl shadow-warm-md overflow-hidden",
          maxWidthClasses[maxWidth],
        ].join(" ")}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-doggram-border">
            <h2 className="text-base font-bold text-doggram-brown-dark">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark hover:bg-doggram-border/50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark hover:bg-doggram-border/50 transition-colors z-10"
          >
            <X size={18} />
          </button>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
