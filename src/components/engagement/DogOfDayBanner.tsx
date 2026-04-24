"use client";

import Image from "next/image";
import Link from "next/link";
import { useDogOfDay } from "@/lib/hooks/useRanking";

export function DogOfDayBanner() {
  const { dogOfDay, loading } = useDogOfDay();

  if (loading) {
    return (
      <div className="mx-3 mt-3 h-20 rounded-2xl bg-doggram-border animate-pulse" />
    );
  }

  if (!dogOfDay) return null;

  return (
    <Link href={`/${dogOfDay.username}`}>
      <div className="mx-3 mt-3 rounded-2xl overflow-hidden border border-doggram-amber/40 shadow-warm bg-gradient-to-r from-doggram-amber/15 to-doggram-orange/15">
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Crown badge */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-doggram-amber shadow-warm relative">
              {dogOfDay.avatar_url ? (
                <Image
                  src={dogOfDay.avatar_url}
                  alt={dogOfDay.dog_name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="w-full h-full gradient-doggram flex items-center justify-center">
                  <span className="text-2xl">🐶</span>
                </div>
              )}
            </div>
            <span className="absolute -top-2 -right-1 text-lg leading-none">👑</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-doggram-amber uppercase tracking-widest leading-tight">
              Dog do Dia
            </p>
            <p className="text-sm font-black text-doggram-brown-dark leading-tight truncate">
              {dogOfDay.dog_name}
            </p>
            {dogOfDay.breed && (
              <p className="text-xs text-doggram-brown-soft font-medium truncate">
                {dogOfDay.breed}
              </p>
            )}
          </div>

          {/* Likes count */}
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-black text-doggram-orange leading-tight">
              {dogOfDay.today_likes.toLocaleString("pt-BR")}
            </p>
            <p className="text-[10px] text-doggram-brown-soft font-semibold leading-tight">
              au-aus hoje
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
