"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { XPBar } from "@/components/engagement/XPBar";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Achievement, ProfileAchievement } from "@/types/engagement";

const CATEGORY_LABELS: Record<string, string> = {
  social:    "🐾 Social",
  post:      "📸 Fotos",
  level:     "⭐ Nível",
  quiz:      "🧠 Quiz",
  challenge: "🎯 Desafios",
};

export default function AchievementsPage() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      try {
        const [{ data: all }, { data: mine }] = await Promise.all([
          supabase.from("achievements").select("*").order("category").order("xp_reward"),
          supabase
            .from("profile_achievements")
            .select("achievement_id, earned_at")
            .eq("profile_id", profile!.id),
        ]);

        if (cancelled) return;

        setAllAchievements((all as Achievement[]) ?? []);
        setEarned(new Set(((mine as ProfileAchievement[]) ?? []).map((a) => a.achievement_id)));
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profile]);

  const byCategory = allAchievements.reduce<Record<string, Achievement[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  const earnedCount = earned.size;
  const totalCount = allAchievements.length;

  if (profileLoading || !profile) {
    return (
      <div className="px-4 pt-4 space-y-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 bg-doggram-warm-white border-b border-doggram-border">
        <h1 className="text-xl font-black text-doggram-brown-dark mb-0.5">Conquistas</h1>
        <p className="text-sm text-doggram-brown-soft font-medium">
          {earnedCount} de {totalCount} desbloqueadas
        </p>
      </div>

      {/* ── XP bar ── */}
      <div className="px-4 pt-4">
        <XPBar xp={profile.xp ?? 0} quizStreak={profile.quiz_streak ?? 0} />
      </div>

      {/* ── Progress ring ── */}
      <div className="px-4 pt-4">
        <div className="bg-doggram-warm-white rounded-2xl border border-doggram-border p-4 flex items-center gap-4">
          {/* Circle progress */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--doggram-border)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26"
                fill="none"
                stroke="var(--doggram-orange)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - earnedCount / Math.max(totalCount, 1))}`}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-doggram-orange">
                {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>
          <div>
            <p className="font-black text-doggram-brown-dark text-base leading-tight">
              {earnedCount}/{totalCount}
            </p>
            <p className="text-xs text-doggram-brown-soft font-medium leading-snug">
              conquistas desbloqueadas
            </p>
            {earnedCount === totalCount && (
              <p className="text-xs text-doggram-orange font-bold mt-0.5">
                🏆 Coleção completa!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Achievements by category ── */}
      {loading ? (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="px-4 pt-4">
            <p className="text-xs font-black text-doggram-brown-soft uppercase tracking-widest mb-2">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {items.map((achievement) => {
                const isEarned = earned.has(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl p-4 border flex flex-col gap-2 transition-all
                      ${isEarned
                        ? "bg-doggram-warm-white border-doggram-orange/30 shadow-warm"
                        : "bg-doggram-cream border-doggram-border opacity-50"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`text-3xl leading-none ${!isEarned ? "grayscale" : ""}`}>
                        {achievement.emoji}
                      </span>
                      {isEarned ? (
                        <span className="text-[10px] font-bold text-doggram-success bg-doggram-success/10 px-1.5 py-0.5 rounded-full">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-doggram-brown-soft">
                          🔒
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-doggram-brown-dark leading-tight">
                        {achievement.name}
                      </p>
                      <p className="text-[11px] text-doggram-brown-soft leading-snug mt-0.5">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.xp_reward > 0 && (
                      <p className="text-[10px] font-bold text-doggram-orange">
                        +{achievement.xp_reward} XP
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
