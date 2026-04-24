"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PawMatchProfile } from "@/types/pawmatch";
import type { Profile } from "@/types/profile";

const CONFETTI_COLORS = [
  "#FF8C42",
  "#FFB347",
  "#FF5E78",
  "#4CAF50",
  "#FFFAF5",
  "#FFD700",
  "#C084FC",
];

interface ConfettiPiece {
  id: number;
  color: string;
  left: string;
  duration: string;
  delay: string;
  width: number;
  height: number;
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 55 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${(i * 1.85) % 100}%`,
    duration: `${1.6 + ((i * 137) % 100) / 100}s`,
    delay: `${((i * 97) % 120) / 100}s`,
    width: 5 + (i % 5),
    height: 8 + (i % 7),
  }));
}

interface MatchCelebrationProps {
  matchedProfile: PawMatchProfile;
  currentProfile: Profile;
  onClose: () => void;
}

export function MatchCelebration({
  matchedProfile,
  currentProfile,
  onClose,
}: MatchCelebrationProps) {
  const router = useRouter();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  // Generate client-side only to avoid SSR mismatch
  useEffect(() => {
    setConfetti(makeConfetti());
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {confetti.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 rounded-sm"
            style={{
              left: p.left,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animation: `confetti-fall ${p.duration} ease-in ${p.delay} both`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 animate-match-pop bg-doggram-warm-white rounded-3xl mx-5 p-7 text-center shadow-2xl max-w-xs w-full">
        <p className="text-5xl mb-3 leading-none">🐾</p>
        <h2 className="text-[22px] font-black text-doggram-brown-dark mb-1.5 leading-tight">
          É um PawMatch!
        </h2>
        <p className="text-sm text-doggram-brown-soft font-medium mb-7 leading-relaxed">
          <span className="font-bold text-doggram-orange">{currentProfile.dog_name}</span> e{" "}
          <span className="font-bold text-doggram-coral">{matchedProfile.dog_name}</span> querem se farejar!
        </p>

        {/* Avatar pair */}
        <div className="flex items-center justify-center gap-5 mb-7">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-doggram-orange shadow-warm relative flex-shrink-0">
            {currentProfile.avatar_url ? (
              <Image
                src={currentProfile.avatar_url}
                alt={currentProfile.dog_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full gradient-doggram flex items-center justify-center">
                <span className="text-3xl">🐶</span>
              </div>
            )}
          </div>

          <span className="text-3xl animate-pulse">💞</span>

          <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-doggram-coral shadow-warm relative flex-shrink-0">
            {matchedProfile.avatar_url ? (
              <Image
                src={matchedProfile.avatar_url}
                alt={matchedProfile.dog_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-doggram-coral flex items-center justify-center">
                <span className="text-3xl">🐶</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => router.push("/messages")}
          className="w-full py-3.5 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm mb-3 transition-transform duration-150 active:scale-95"
        >
          Enviar mensagem 💬
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl border-2 border-doggram-border text-doggram-brown-soft font-semibold text-sm transition-colors hover:border-doggram-orange hover:text-doggram-orange active:scale-95"
        >
          Continuar farejarando
        </button>
      </div>
    </div>
  );
}
