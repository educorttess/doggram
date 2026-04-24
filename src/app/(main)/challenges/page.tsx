"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Users, Calendar } from "lucide-react";
import { useChallenges } from "@/lib/hooks/useChallenges";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { Skeleton } from "@/components/ui/Skeleton";

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  const e = new Date(end + "T00:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  return `${s} – ${e}`;
}

export default function ChallengesPage() {
  const { profile } = useCurrentProfile();
  const { current, past, myEntry, participantCount, loading, participate } =
    useChallenges(profile?.id ?? null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  async function handleParticipate() {
    setJoining(true);
    await participate();
    setJoined(true);
    setJoining(false);
  }

  const alreadyIn = !!myEntry || joined;

  return (
    <div className="pb-6">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 bg-doggram-warm-white border-b border-doggram-border">
        <h1 className="text-xl font-black text-doggram-brown-dark mb-0.5">Desafios Semanais</h1>
        <p className="text-sm text-doggram-brown-soft font-medium">
          Complete desafios e ganhe XP bônus
        </p>
      </div>

      {/* ── Desafio atual ── */}
      <div className="px-4 pt-4">
        <p className="text-xs font-black text-doggram-brown-soft uppercase tracking-widest mb-2">
          Desafio desta semana
        </p>

        {loading ? (
          <Skeleton className="h-56 rounded-2xl" />
        ) : current ? (
          <div className="bg-gradient-to-br from-doggram-orange/10 to-doggram-amber/10 border-2 border-doggram-orange/30 rounded-3xl p-5 shadow-warm">
            {/* Emoji + title */}
            <div className="flex items-start gap-3 mb-3">
              <span className="text-5xl leading-none">{current.emoji}</span>
              <div className="flex-1">
                <p className="text-xs font-black text-doggram-orange uppercase tracking-wider">
                  Desafio da semana
                </p>
                <h2 className="text-lg font-black text-doggram-brown-dark leading-tight">
                  {current.title}
                </h2>
              </div>
            </div>

            <p className="text-sm text-doggram-brown-mid font-medium leading-relaxed mb-4">
              {current.description}
            </p>

            {/* Meta info */}
            <div className="flex items-center gap-3 mb-4 text-xs text-doggram-brown-soft font-semibold">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDateRange(current.week_start, current.week_end)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {participantCount} participante{participantCount !== 1 ? "s" : ""}
              </span>
              <span className="ml-auto font-black text-doggram-orange">
                +{current.xp_reward} XP
              </span>
            </div>

            {/* CTA */}
            {!profile ? (
              <Link
                href="/login"
                className="block w-full text-center py-3.5 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95"
              >
                Entrar para participar
              </Link>
            ) : alreadyIn ? (
              <div className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-doggram-success/10 border border-doggram-success/30">
                <CheckCircle size={18} className="text-doggram-success" />
                <p className="text-sm font-bold text-doggram-success">
                  Você está participando! 🎉
                </p>
              </div>
            ) : (
              <button
                onClick={handleParticipate}
                disabled={joining}
                className="w-full py-3.5 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95 disabled:opacity-50"
              >
                {joining ? "Entrando..." : `Participar e ganhar +${current.xp_reward} XP 🐾`}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center rounded-2xl bg-doggram-warm-white border border-doggram-border">
            <span className="text-5xl">🎯</span>
            <p className="text-sm text-doggram-brown-soft font-medium">
              Nenhum desafio esta semana ainda. Volte em breve!
            </p>
          </div>
        )}
      </div>

      {/* ── Histórico ── */}
      {past.length > 0 && (
        <div className="px-4 pt-6">
          <p className="text-xs font-black text-doggram-brown-soft uppercase tracking-widest mb-3">
            Desafios anteriores
          </p>
          <div className="space-y-2">
            {past.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-doggram-warm-white border border-doggram-border"
              >
                <span className="text-2xl leading-none flex-shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-doggram-brown-dark leading-tight truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-doggram-brown-soft">
                    {formatDateRange(c.week_start, c.week_end)}
                  </p>
                </div>
                <span className="text-xs font-bold text-doggram-brown-soft flex-shrink-0">
                  +{c.xp_reward} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
