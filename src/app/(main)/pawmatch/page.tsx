"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePawMatch } from "@/lib/hooks/usePawMatch";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { SwipeCard } from "@/components/pawmatch/SwipeCard";
import { MatchCelebration } from "@/components/pawmatch/MatchCelebration";
import { PawIcon } from "@/components/pawmatch/PawIcon";

export default function PawMatchPage() {
  const { profile } = useCurrentProfile();
  const { candidates, loading, swipe, newMatch, clearMatch } = usePawMatch(
    profile?.id ?? null
  );

  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleSwipe = useCallback(
    (dir: "like" | "skip") => {
      if (animating || candidates.length === 0) return;
      setExitDir(dir === "like" ? "right" : "left");
      setAnimating(true);
      setTimeout(() => {
        swipe(dir);
        setExitDir(null);
        setAnimating(false);
      }, 360);
    },
    [animating, candidates.length, swipe]
  );

  const topThree = candidates.slice(0, 3);

  return (
    <div className="flex flex-col px-4" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div className="flex items-center gap-2">
          <PawIcon size={26} className="text-doggram-orange" filled />
          <h1 className="text-xl font-black text-doggram-brown-dark tracking-tight">
            PawMatch
          </h1>
        </div>
        <Link
          href="/pawmatch/matches"
          className="text-sm font-bold text-doggram-orange bg-doggram-orange/10 border border-doggram-orange/25 rounded-full px-4 py-1.5 transition-colors hover:bg-doggram-orange/20 active:scale-95"
        >
          Meus Matches
        </Link>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {loading ? (
          <div className="relative w-full max-w-sm" style={{ height: 420 }}>
            <div className="absolute inset-0 rounded-3xl bg-doggram-border animate-pulse" />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-doggram-border/80 to-transparent" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
            <span className="text-7xl">🐾</span>
            <h3 className="text-xl font-black text-doggram-brown-dark">Por hoje é só!</h3>
            <p className="text-sm text-doggram-brown-soft font-medium max-w-[200px] leading-relaxed">
              Você farejarou todos os dogs disponíveis. Volte mais tarde!
            </p>
          </div>
        ) : (
          <div
            className="relative w-full max-w-sm"
            style={{ height: 420 }}
          >
            {/* Render back-to-front so z-index stacks correctly */}
            {[...topThree].reverse().map((candidate, reversedIdx) => {
              const idx = topThree.length - 1 - reversedIdx;
              return (
                <SwipeCard
                  key={candidate.id}
                  profile={candidate}
                  stackIndex={idx}
                  exitDir={idx === 0 ? exitDir : null}
                  promoting={idx > 0 && exitDir !== null}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!loading && candidates.length > 0 && (
        <div className="flex items-center justify-center gap-10 py-5">
          {/* Skip — X */}
          <button
            onClick={() => handleSwipe("skip")}
            disabled={animating}
            aria-label="Pular"
            className="w-16 h-16 rounded-full bg-white border-2 border-doggram-error/30 flex items-center justify-center shadow-warm transition-transform duration-150 active:scale-90 disabled:opacity-40"
          >
            <X size={30} strokeWidth={2.5} className="text-doggram-error" />
          </button>

          {/* Like — paw */}
          <button
            onClick={() => handleSwipe("like")}
            disabled={animating}
            aria-label="Farejar"
            className="w-20 h-20 rounded-full gradient-doggram flex items-center justify-center shadow-warm-md transition-transform duration-150 active:scale-90 disabled:opacity-40"
          >
            <PawIcon size={34} className="text-white" filled />
          </button>
        </div>
      )}

      {/* Match celebration overlay */}
      {newMatch && profile && (
        <MatchCelebration
          matchedProfile={newMatch}
          currentProfile={profile}
          onClose={clearMatch}
        />
      )}
    </div>
  );
}
