"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface NavItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  activeIcon?: ReactNode;
  active?: boolean;
  special?: boolean;
}

export function NavItem({ href, label, icon, activeIcon, active = false, special = false }: NavItemProps) {
  if (special) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center justify-center"
        aria-label={label}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-doggram-orange to-doggram-amber flex items-center justify-center shadow-warm text-white transition-transform duration-200 active:scale-90">
          {icon}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={[
        "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 overflow-hidden py-1 transition-colors duration-200",
        active ? "text-doggram-orange" : "text-doggram-brown-soft",
      ].join(" ")}
      aria-label={label}
    >
      <span className="transition-transform duration-200 active:scale-90 shrink-0">
        {active && activeIcon ? activeIcon : icon}
      </span>
      <span className={`text-[9px] font-semibold truncate w-full text-center leading-tight ${active ? "opacity-100" : "opacity-70"}`}>
        {label}
      </span>
    </Link>
  );
}
