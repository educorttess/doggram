"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { awardXP } from "./useXP";
import type { Challenge, ChallengeEntry } from "@/types/engagement";

export function useChallenges(profileId: string | null) {
  const [current, setCurrent] = useState<Challenge | null>(null);
  const [past, setPast] = useState<Challenge[]>([]);
  const [myEntry, setMyEntry] = useState<ChallengeEntry | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const [{ data: allChallenges }, { data: entries }] = await Promise.all([
        supabase
          .from("challenges")
          .select("*")
          .order("week_start", { ascending: false })
          .limit(10),
        profileId
          ? supabase
              .from("challenge_entries")
              .select("*")
              .eq("profile_id", profileId)
          : Promise.resolve({ data: [] }),
      ]);

      if (cancelled) return;

      const all = (allChallenges as Challenge[]) ?? [];
      const cur = all.find((c) => c.week_start <= today && c.week_end >= today) ?? null;
      const hist = all.filter((c) => c.week_end < today);

      const myEntries = (entries as ChallengeEntry[]) ?? [];
      const mine = cur ? myEntries.find((e) => e.challenge_id === cur.id) ?? null : null;

      setCurrent(cur);
      setPast(hist);
      setMyEntry(mine);

      if (cur) {
        const { count } = await supabase
          .from("challenge_entries")
          .select("id", { count: "exact", head: true })
          .eq("challenge_id", cur.id);
        if (!cancelled) setParticipantCount(count ?? 0);
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [profileId]);

  const participate = useCallback(
    async (postId?: string) => {
      if (!profileId || !current || myEntry) return;
      const supabase = createClient();

      const { data } = await supabase
        .from("challenge_entries")
        .insert({
          challenge_id: current.id,
          profile_id: profileId,
          post_id: postId ?? null,
          xp_awarded: true,
        })
        .select()
        .single();

      if (data) {
        setMyEntry(data as ChallengeEntry);
        setParticipantCount((n) => n + 1);
        await awardXP(profileId, current.xp_reward, `challenge:${current.id}`);
      }
    },
    [profileId, current, myEntry]
  );

  return { current, past, myEntry, participantCount, loading, participate };
}
