"use client";

import Link from "next/link";
import { getLevelInfo, getLevelProgress, LEVELS } from "@/types/engagement";

interface XPBarProps {
  xp: number;
  quizStreak?: number;
  linkToAchievements?: boolean;
}

export function XPBar({ xp, quizStreak = 0, linkToAchievements = false }: XPBarProps) {
  const info = getLevelInfo(xp);
  const progress = getLevelProgress(xp);
  const isMax = info.level === LEVELS.length;
  const nextLevel = LEVELS[info.level]; // undefined at max

  const xpToNext = isMax ? null : nextLevel.minXP - xp;

  const bar = (
    <div className="bg-doggram-warm-white rounded-2xl p-4 border border-doggram-border shadow-warm space-y-2.5">
      {/* Level + streak row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{info.emoji}</span>
          <div>
            <p className="text-xs text-doggram-brown-soft font-semibold leading-tight">Nível {info.level}</p>
            <p className="text-base font-black text-doggram-brown-dark leading-tight">{info.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {quizStreak > 0 && (
            <div className="flex items-center gap-1 text-sm font-bold text-doggram-amber">
              <span>🔥</span>
              <span>{quizStreak}</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-[11px] text-doggram-brown-soft font-semibold leading-tight">XP total</p>
            <p className="text-base font-black text-doggram-orange leading-tight">
              {xp.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2.5 w-full bg-doggram-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-doggram-orange to-doggram-amber transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-doggram-brown-soft font-semibold">
            {info.minXP.toLocaleString("pt-BR")} XP
          </span>
          <span className="text-[10px] text-doggram-brown-soft font-semibold">
            {isMax
              ? "Nível máximo! 🏆"
              : `Faltam ${xpToNext} XP para ${nextLevel.name}`}
          </span>
        </div>
      </div>

      {/* Quick nav links */}
      {linkToAchievements && (
        <div className="flex gap-2 pt-0.5">
          <Link
            href="/achievements"
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-doggram-orange bg-doggram-orange/10 hover:bg-doggram-orange/20 transition-colors"
          >
            🏅 Conquistas
          </Link>
          <Link
            href="/challenges"
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-doggram-orange bg-doggram-orange/10 hover:bg-doggram-orange/20 transition-colors"
          >
            🎯 Desafios
          </Link>
          <Link
            href="/quiz"
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-doggram-orange bg-doggram-orange/10 hover:bg-doggram-orange/20 transition-colors"
          >
            🧠 Quiz
          </Link>
        </div>
      )}
    </div>
  );

  return bar;
}
