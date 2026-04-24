"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { awardXP } from "./useXP";
import type { PawMatchProfile } from "@/types/pawmatch";

export function usePawMatch(currentProfileId: string | null) {
  const [candidates, setCandidates] = useState<PawMatchProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMatch, setNewMatch] = useState<PawMatchProfile | null>(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!currentProfileId) return;
    let cancelled = false;

    async function load() {
      const supabase = createClient();

      const { data: swiped } = await supabase
        .from("paw_swipes")
        .select("swiped_id")
        .eq("swiper_id", currentProfileId);

      const swipedIds: string[] = (swiped ?? []).map((s: any) => s.swiped_id);

      let query = supabase
        .from("profiles")
        .select("id, username, dog_name, breed, bio, avatar_url, birth_date, is_verified")
        .neq("id", currentProfileId)
        .limit(20);

      if (swipedIds.length > 0) {
        query = (query as any).not("id", "in", `(${swipedIds.join(",")})`);
      }

      const { data } = await query;
      if (!cancelled) {
        setCandidates((data as PawMatchProfile[]) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [currentProfileId]);

  const swipe = useCallback(async (direction: "like" | "skip") => {
    if (!currentProfileId || candidates.length === 0 || pendingRef.current) return;
    pendingRef.current = true;

    const target = candidates[0];
    // Optimistic removal
    setCandidates((prev) => prev.slice(1));

    try {
      const supabase = createClient();

      await supabase.from("paw_swipes").insert({
        swiper_id: currentProfileId,
        swiped_id: target.id,
        direction,
      });

      if (direction === "like") {
        const { data: mutual } = await supabase
          .from("paw_swipes")
          .select("id")
          .eq("swiper_id", target.id)
          .eq("swiped_id", currentProfileId)
          .eq("direction", "like")
          .maybeSingle();

        if (mutual) {
          const a = currentProfileId < target.id ? currentProfileId : target.id;
          const b = currentProfileId < target.id ? target.id : currentProfileId;
          await supabase
            .from("paw_matches")
            .upsert(
              { profile_a_id: a, profile_b_id: b },
              { onConflict: "profile_a_id,profile_b_id", ignoreDuplicates: true }
            );
          awardXP(currentProfileId, 100, "pawmatch").catch(() => {});
          setNewMatch(target);
        }
      }
    } finally {
      pendingRef.current = false;
    }
  }, [currentProfileId, candidates]);

  return {
    candidates,
    loading,
    swipe,
    newMatch,
    clearMatch: () => setNewMatch(null),
  };
}
