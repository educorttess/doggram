"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-gradient-to-r from-doggram-orange to-doggram-amber text-white shadow-warm hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-transparent border-2 border-doggram-orange text-doggram-orange hover:bg-doggram-orange/10 active:scale-[0.98] disabled:opacity-50",
  ghost:
    "bg-transparent text-doggram-brown-mid hover:text-doggram-orange hover:bg-doggram-orange/8 active:scale-[0.98] disabled:opacity-40",
  danger:
    "bg-doggram-error text-white hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-2xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer select-none",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}
