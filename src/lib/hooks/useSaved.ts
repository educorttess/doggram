"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSaved(postId: string, profileId: string | null) {
  const [saved, setSaved] = useState(false);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!profileId || !postId) return;
    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const { data } = await supabase
        .from("saved_posts")
        .select("id")
        .eq("profile_id", profileId!)
        .eq("post_id", postId)
        .maybeSingle();
      if (!cancelled) setSaved(!!data);
    }

    check();
    return () => { cancelled = true; };
  }, [postId, profileId]);

  const toggle = useCallback(async () => {
    if (!profileId || pendingRef.current) return;
    pendingRef.current = true;
    const wasSaved = saved;
    setSaved(!wasSaved);

    try {
      const supabase = createClient();
      if (wasSaved) {
        await supabase
          .from("saved_posts")
          .delete()
          .eq("profile_id", profileId)
          .eq("post_id", postId);
      } else {
        await supabase
          .from("saved_posts")
          .insert({ profile_id: profileId, post_id: postId });
      }
    } catch {
      setSaved(wasSaved);
    } finally {
      pendingRef.current = false;
    }
  }, [postId, profileId, saved]);

  return { saved, toggle };
}
