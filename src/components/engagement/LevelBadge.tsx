import { getLevelInfo } from "@/types/engagement";

interface LevelBadgeProps {
  xp: number;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ xp, size = "md" }: LevelBadgeProps) {
  const info = getLevelInfo(xp);

  const sizeClass = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-1 gap-1",
    lg: "text-sm px-3 py-1.5 gap-1.5",
  }[size];

  const emoji = {
    sm: "",
    md: info.emoji,
    lg: info.emoji,
  }[size];

  return (
    <span
      className={`inline-flex items-center ${sizeClass} rounded-full font-bold bg-gradient-to-r from-doggram-orange to-doggram-amber text-white shadow-warm`}
    >
      {emoji && <span className="leading-none">{emoji}</span>}
      {info.name}
    </span>
  );
}
