"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  maxChars?: number;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  maxChars,
  type,
  className = "",
  value,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const charCount = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-doggram-brown-mid">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-doggram-brown-soft pointer-events-none">
            {leftIcon}
          </span>
        )}

        <input
          type={inputType}
          value={value}
          className={[
            "w-full bg-doggram-surface border rounded-2xl py-3 pr-4 text-sm font-medium text-doggram-brown-dark placeholder:text-doggram-brown-soft outline-none transition-all duration-200",
            leftIcon ? "pl-10" : "pl-4",
            isPassword ? "pr-11" : "",
            error
              ? "border-doggram-error focus:ring-2 focus:ring-doggram-error/30"
              : "border-doggram-border focus:border-doggram-orange focus:ring-2 focus:ring-doggram-orange/20",
            className,
          ].join(" ")}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 text-doggram-brown-soft hover:text-doggram-brown-mid transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {maxChars && (
          <span className="absolute right-3.5 text-xs text-doggram-brown-soft tabular-nums">
            {charCount}/{maxChars}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-doggram-error font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-doggram-brown-soft">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxChars?: number;
}

export function Textarea({ label, error, maxChars, className = "", value, ...props }: TextareaProps) {
  const charCount = typeof value === "string" ? value.length : 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-doggram-brown-mid">{label}</label>
          {maxChars && (
            <span className="text-xs text-doggram-brown-soft tabular-nums">
              {charCount}/{maxChars}
            </span>
          )}
        </div>
      )}

      <textarea
        value={value}
        className={[
          "w-full bg-doggram-surface border rounded-2xl py-3 px-4 text-sm font-medium text-doggram-brown-dark placeholder:text-doggram-brown-soft outline-none transition-all duration-200 resize-none",
          error
            ? "border-doggram-error focus:ring-2 focus:ring-doggram-error/30"
            : "border-doggram-border focus:border-doggram-orange focus:ring-2 focus:ring-doggram-orange/20",
          className,
        ].join(" ")}
        {...props}
      />

      {error && <p className="text-xs text-doggram-error font-medium">{error}</p>}
    </div>
  );
}
