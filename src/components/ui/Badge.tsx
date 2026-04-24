import { ReactNode } from "react";
import { BadgeCheck } from "lucide-react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "verified" | "breed" | "count";
  className?: string;
}

const variantClasses = {
  default:  "bg-doggram-border text-doggram-brown-mid",
  verified: "bg-gradient-to-r from-doggram-orange to-doggram-amber text-white",
  breed:    "bg-doggram-warm-white border border-doggram-border text-doggram-brown-mid",
  count:    "bg-doggram-coral/15 text-doggram-coral",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {variant === "verified" && <BadgeCheck size={12} />}
      {children}
    </span>
  );
}
