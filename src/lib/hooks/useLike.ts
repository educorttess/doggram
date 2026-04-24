"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { awardXP } from "./useXP";

export function useLike(
  postId: string,
  initialLiked: boolean,
  initialCount: number,
  profileId: string | null
) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const pendingRef = useRef(false);

  const toggle = useCallback(async () => {
    if (!profileId || pendingRef.current) return;
    pendingRef.current = true;

    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      const supabase = createClient();
      if (wasLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("profile_id", profileId)
          .eq("post_id", postId);
      } else {
        await supabase.from("likes").insert({ profile_id: profileId, post_id: postId });
        awardXP(profileId, 5, "like").catch(() => {});
      }
    } catch {
      // Revert
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      pendingRef.current = false;
    }
  }, [postId, liked, profileId]);

  return { liked, count, toggle };
}
