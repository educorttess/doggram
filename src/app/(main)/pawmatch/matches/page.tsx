"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { PawIcon } from "@/components/pawmatch/PawIcon";
import type { PawMatchProfile } from "@/types/pawmatch";

interface MatchEntry {
  id: string;
  created_at: string;
  matched_profile: PawMatchProfile;
}

export default function MatchesPage() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [matches, setMatches] = useState<MatchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const [{ data: asA }, { data: asB }] = await Promise.all([
        supabase
          .from("paw_matches")
          .select(
            "id, created_at, profiles!paw_matches_profile_b_id_fkey(id, username, dog_name, breed, bio, avatar_url, birth_date, is_verified)"
          )
          .eq("profile_a_id", profile!.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("paw_matches")
          .select(
            "id, created_at, profiles!paw_matches_profile_a_id_fkey(id, username, dog_name, breed, bio, avatar_url, birth_date, is_verified)"
          )
          .eq("profile_b_id", profile!.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!cancelled) {
        const combined: MatchEntry[] = [
          ...((asA ?? []) as any[]).map((m) => ({
            id: m.id,
            created_at: m.created_at,
            matched_profile: m.profiles as PawMatchProfile,
          })),
          ...((asB ?? []) as any[]).map((m) => ({
            id: m.id,
            created_at: m.created_at,
            matched_profile: m.profiles as PawMatchProfile,
          })),
        ].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setMatches(combined);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const isLoading = profileLoading || loading;

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/pawmatch"
          className="p-2 -ml-2 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </Link>
        <PawIcon size={20} className="text-doggram-orange" filled />
        <h1 className="text-xl font-black text-doggram-brown-dark flex-1">
          Meus PawMatches
        </h1>
        {!isLoading && (
          <span className="text-sm font-bold text-doggram-orange bg-doggram-orange/10 rounded-full px-3 py-1">
            {matches.length}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[76px] rounded-2xl bg-doggram-border animate-pulse"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <span className="text-7xl">🐾</span>
          <h3 className="text-lg font-black text-doggram-brown-dark">
            Nenhum match ainda
          </h3>
          <p className="text-sm text-doggram-brown-soft font-medium leading-relaxed max-w-[200px]">
            Continue farejarando para fazer novos amigos!
          </p>
          <Link
            href="/pawmatch"
            className="mt-2 px-6 py-3 rounded-2xl gradient-doggram text-white font-bold text-sm shadow-warm transition-transform active:scale-95"
          >
            Ir farejar 🐾
          </Link>
        </div>
      ) : (
        /* Match list */
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-3 bg-doggram-warm-white rounded-2xl p-3 border border-doggram-border shadow-warm"
            >
              {/* Avatar → profile link */}
              <Link href={`/${match.matched_profile.username}`} className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-doggram-border relative">
                  {match.matched_profile.avatar_url ? (
                    <Image
                      src={match.matched_profile.avatar_url}
                      alt={match.matched_profile.dog_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-doggram flex items-center justify-center">
                      <span className="text-2xl">🐶</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-doggram-brown-dark text-sm leading-tight truncate">
                  {match.matched_profile.dog_name}
                </p>
                {match.matched_profile.breed && (
                  <p className="text-xs text-doggram-brown-soft truncate">
                    {match.matched_profile.breed}
                  </p>
                )}
                <p className="text-[11px] text-doggram-brown-soft mt-0.5 flex items-center gap-1">
                  <PawIcon size={10} className="text-doggram-orange" filled />
                  PawMatch •{" "}
                  {new Date(match.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Message CTA */}
              <Link
                href="/messages"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-doggram text-white text-xs font-bold shadow-warm transition-transform active:scale-95 flex-shrink-0"
              >
                <MessageCircle size={13} />
                Latir
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
