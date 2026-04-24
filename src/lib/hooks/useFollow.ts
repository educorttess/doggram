"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useFollow(targetProfileId: string) {
  const [following, setFollowing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const pendingRef = useRef(false);
  const myProfileIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!targetProfileId) return;

    async function init() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) { setInitialized(true); return; }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("owner_id", authData.user.id)
        .maybeSingle();

      if (!profileData) { setInitialized(true); return; }
      myProfileIdRef.current = (profileData as { id: string }).id;

      const { data: followData } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", myProfileIdRef.current)
        .eq("following_id", targetProfileId)
        .maybeSingle();

      setFollowing(!!followData);
      setInitialized(true);
    }

    init();
  }, [targetProfileId]);

  const toggle = useCallback(async () => {
    const myId = myProfileIdRef.current;
    if (!myId || pendingRef.current || myId === targetProfileId) return;
    pendingRef.current = true;

    const wasFollowing = following;
    setFollowing(!wasFollowing);

    try {
      const supabase = createClient();
      if (wasFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", myId)
          .eq("following_id", targetProfileId);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: myId, following_id: targetProfileId });
      }
    } catch {
      setFollowing(wasFollowing);
    } finally {
      pendingRef.current = false;
    }
  }, [targetProfileId, following]);

  return { following, initialized, toggle };
}
