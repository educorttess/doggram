interface PawIconProps {
  size?: number;
  className?: string;
  filled?: boolean;
}

export function PawIcon({ size = 24, className = "", filled = false }: PawIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Main central pad */}
      <ellipse cx="12" cy="16.5" rx="4.5" ry="3.5" />
      {/* Toe pads */}
      <ellipse cx="6"  cy="11"  rx="2"   ry="2.5" />
      <ellipse cx="10" cy="8.5" rx="1.8" ry="2.2" />
      <ellipse cx="14" cy="8.5" rx="1.8" ry="2.2" />
      <ellipse cx="18" cy="11"  rx="2"   ry="2.5" />
    </svg>
  );
}
