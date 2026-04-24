"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { PawMatchProfile } from "@/types/pawmatch";

function getAge(birthDate: string | null): string {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months}m`;
  return `${Math.floor(months / 12)}a`;
}

interface SwipeCardProps {
  profile: PawMatchProfile;
  stackIndex: number;      // 0 = top interactive card, 1-2 = decorative back cards
  exitDir: "left" | "right" | null;
  promoting?: boolean;     // back card is moving up because top card is exiting
}

export function SwipeCard({ profile, stackIndex, exitDir, promoting = false }: SwipeCardProps) {
  const age = getAge(profile.birth_date);
  const isTop = stackIndex === 0;

  const displayIdx = promoting ? stackIndex - 1 : stackIndex;
  const adjustedIdx = Math.max(0, displayIdx);

  const exitClass =
    isTop && exitDir === "right"
      ? "animate-swipe-right"
      : isTop && exitDir === "left"
      ? "animate-swipe-left"
      : "";

  const backStyle: React.CSSProperties = isTop
    ? {}
    : {
        transform: `translateY(${adjustedIdx * 16}px) scale(${1 - adjustedIdx * 0.05})`,
        zIndex: 30 - stackIndex * 10,
        pointerEvents: "none",
      };

  return (
    <div
      className={[
        "absolute inset-0 rounded-3xl overflow-hidden bg-doggram-border shadow-warm-md",
        isTop ? "z-30" : "transition-[transform] duration-300 ease-out",
        exitClass,
      ]
        .filter(Boolean)
        .join(" ")}
      style={backStyle}
    >
      {profile.avatar_url ? (
        <Image
          src={profile.avatar_url}
          alt={profile.dog_name}
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 400px"
          priority={isTop}
        />
      ) : (
        <div className="absolute inset-0 gradient-doggram flex items-center justify-center">
          <span className="text-[96px] leading-none">🐶</span>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-2xl font-black leading-tight drop-shadow-sm">
            {profile.dog_name}
          </h2>
          {age && (
            <span className="text-lg font-bold opacity-90 drop-shadow-sm">{age}</span>
          )}
          {profile.is_verified && (
            <ShieldCheck
              size={18}
              className="text-doggram-amber drop-shadow-sm"
              fill="#FFB347"
              stroke="none"
            />
          )}
        </div>

        {profile.breed && (
          <p className="text-sm font-semibold opacity-75 mb-2">{profile.breed}</p>
        )}

        {profile.bio && (
          <p className="text-sm font-medium opacity-90 leading-snug line-clamp-2">
            {profile.bio}
          </p>
        )}
      </div>
    </div>
  );
}
