"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { useRanking } from "@/lib/hooks/useRanking";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const { ranking, dogOfDay, loading } = useRanking();

  return (
    <div className="pb-4">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 bg-doggram-warm-white border-b border-doggram-border">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={22} className="text-doggram-amber" />
          <h1 className="text-xl font-black text-doggram-brown-dark">Ranking da Semana</h1>
        </div>
        <p className="text-sm text-doggram-brown-soft font-medium">
          Os 10 dogs mais curtidos nos últimos 7 dias
        </p>
      </div>

      {/* ── Dog do Dia ── */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-black text-doggram-amber uppercase tracking-widest mb-2">
          Dog do Dia 👑
        </p>
        {loading ? (
          <div className="h-24 rounded-2xl bg-doggram-border animate-pulse" />
        ) : dogOfDay ? (
          <Link href={`/${dogOfDay.username}`}>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-doggram-amber/20 to-doggram-orange/10 border-2 border-doggram-amber/50 shadow-warm">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-doggram-amber relative">
                  {dogOfDay.avatar_url ? (
                    <Image
                      src={dogOfDay.avatar_url}
                      alt={dogOfDay.dog_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full gradient-doggram flex items-center justify-center">
                      <span className="text-2xl">🐶</span>
                    </div>
                  )}
                </div>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xl leading-none">👑</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-doggram-brown-dark text-base leading-tight truncate">
                  {dogOfDay.dog_name}
                </p>
                {dogOfDay.breed && (
                  <p className="text-xs text-doggram-brown-soft truncate">{dogOfDay.breed}</p>
                )}
                <p className="text-xs text-doggram-brown-soft mt-0.5">@{dogOfDay.username}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-black text-doggram-orange leading-tight">
                  {dogOfDay.today_likes.toLocaleString("pt-BR")}
                </p>
                <p className="text-[10px] text-doggram-brown-soft font-semibold">au-aus hoje</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-2xl bg-doggram-warm-white border border-doggram-border text-center">
            <p className="text-sm text-doggram-brown-soft">Nenhum dog curtido hoje ainda.</p>
          </div>
        )}
      </div>

      {/* ── Top 10 ── */}
      <div className="px-4 pt-2">
        <p className="text-xs font-black text-doggram-brown-soft uppercase tracking-widest mb-3">
          Top 10 — últimos 7 dias
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 text-center">
                  <Skeleton className="h-5 w-5 mx-auto" />
                </div>
                <SkeletonCircle size={48} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-5xl mb-3">🐾</span>
            <p className="text-sm text-doggram-brown-soft font-medium">
              Nenhum like registrado esta semana ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((dog, idx) => (
              <Link key={dog.profile_id} href={`/${dog.username}`}>
                <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors hover:bg-doggram-cream
                  ${idx === 0 ? "bg-gradient-to-r from-doggram-amber/15 to-doggram-orange/5 border-doggram-amber/30" :
                    idx === 1 ? "bg-doggram-warm-white border-doggram-border/80" :
                    idx === 2 ? "bg-doggram-warm-white border-doggram-border/80" :
                    "bg-doggram-warm-white border-doggram-border"}`}
                >
                  {/* Position */}
                  <div className="w-8 flex-shrink-0 text-center">
                    {idx < 3 ? (
                      <span className="text-xl leading-none">{MEDALS[idx]}</span>
                    ) : (
                      <span className="text-sm font-black text-doggram-brown-soft">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-doggram-border relative flex-shrink-0">
                    {dog.avatar_url ? (
                      <Image
                        src={dog.avatar_url}
                        alt={dog.dog_name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full gradient-doggram flex items-center justify-center">
                        <span className="text-xl">🐶</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-doggram-brown-dark text-sm leading-tight truncate">
                        {dog.dog_name}
                      </p>
                      {dog.is_verified && <span className="text-xs">✅</span>}
                    </div>
                    {dog.breed && (
                      <p className="text-xs text-doggram-brown-soft truncate">{dog.breed}</p>
                    )}
                  </div>

                  {/* Likes */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-black leading-tight ${idx === 0 ? "text-doggram-orange text-lg" : "text-doggram-brown-dark text-sm"}`}>
                      {dog.week_likes.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-[10px] text-doggram-brown-soft font-semibold">au-aus</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
