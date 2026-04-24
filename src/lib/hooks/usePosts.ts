"use client";

import { useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostWithProfile } from "@/types/post";
import { FEED_PAGE_SIZE } from "@/constants/config";

interface UsePostsOptions {
  profileId?: string;
  mixed?: boolean; // main feed: mix followed posts with popular suggestions
}

export function usePosts({ profileId, mixed = false }: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  const offsetRef = useRef(0);          // for regular feed
  const followedOffsetRef = useRef(0);  // for mixed feed followed posts
  const loadingRef = useRef(false);
  const myProfileIdRef = useRef<string | null>(null);
  const followedIdsRef = useRef<string[] | null>(null);
  const suggestedCacheRef = useRef<PostWithProfile[]>([]);

  const getMyProfileId = useCallback(async () => {
    if (myProfileIdRef.current) return myProfileIdRef.current;
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("owner_id", auth.user.id)
      .maybeSingle();
    const id = (data as { id: string } | null)?.id ?? null;
    myProfileIdRef.current = id;
    setCurrentProfileId(id);
    return id;
  }, []);

  const loadPosts = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const supabase = createClient();
      const myId = await getMyProfileId();

      // ── MIXED FEED (main feed) ────────────────────────────────────────────
      if (mixed) {
        if (reset) {
          followedOffsetRef.current = 0;
          followedIdsRef.current = null;
          suggestedCacheRef.current = [];
        }

        // Fetch followed IDs once and cache
        if (followedIdsRef.current === null) {
          if (myId) {
            const { data } = await supabase
              .from("follows")
              .select("following_id")
              .eq("follower_id", myId);
            followedIdsRef.current = ((data ?? []) as { following_id: string }[])
              .map((f) => f.following_id);
          } else {
            followedIdsRef.current = [];
          }
        }

        const followedIds = followedIdsRef.current;
        const fOffset = followedOffsetRef.current;

        // Fetch posts from followed profiles (paginated by recency)
        let followedPosts: PostWithProfile[] = [];
        if (followedIds.length > 0) {
          const { data } = await supabase
            .from("posts")
            .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
            .in("profile_id", followedIds)
            .order("created_at", { ascending: false })
            .range(fOffset, fOffset + FEED_PAGE_SIZE - 1);
          followedPosts = (data ?? []) as PostWithProfile[];
        }

        // Fallback to all posts if user follows nobody
        if (followedIds.length === 0) {
          const { data } = await supabase
            .from("posts")
            .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
            .order("created_at", { ascending: false })
            .range(fOffset, fOffset + FEED_PAGE_SIZE - 1);
          followedPosts = (data ?? []) as PostWithProfile[];
        }

        // Fetch popular suggestions on first page only
        if (reset) {
          const excludeIds = [...followedIds, ...(myId ? [myId] : [])];
          let q = supabase
            .from("posts")
            .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
            .order("likes_count", { ascending: false })
            .limit(4);
          if (excludeIds.length > 0) {
            q = q.not("profile_id", "in", `(${excludeIds.join(",")})`);
          }
          const { data } = await q;
          suggestedCacheRef.current = (data ?? []) as PostWithProfile[];
        }

        // Interleave: inject suggested at positions 3 and 7 (0-indexed: after index 2 and 6)
        const suggested = suggestedCacheRef.current.map((p) => ({ ...p, is_suggested: true as const }));
        const interleaved: PostWithProfile[] = [];
        let si = 0;
        for (let i = 0; i < followedPosts.length; i++) {
          interleaved.push(followedPosts[i]);
          if ((i === 2 || i === 6) && si < suggested.length) {
            interleaved.push(suggested[si++]);
          }
        }
        // Append any remaining suggested posts
        while (reset && si < suggested.length) {
          interleaved.push(suggested[si++]);
        }

        // Batch-fetch liked status
        const allIds = interleaved.map((p) => p.id);
        let likedIds: string[] = [];
        if (myId && allIds.length > 0) {
          const { data: ld } = await supabase
            .from("likes")
            .select("post_id")
            .eq("profile_id", myId)
            .in("post_id", allIds);
          likedIds = ((ld ?? []) as { post_id: string }[]).map((l) => l.post_id);
        }

        const enriched = interleaved.map((p) => ({ ...p, is_liked: likedIds.includes(p.id) }));

        followedOffsetRef.current = fOffset + followedPosts.length;

        if (reset) {
          setPosts(enriched);
        } else {
          setPosts((prev) => [...prev, ...enriched]);
        }
        setHasMore(followedPosts.length === FEED_PAGE_SIZE);
        return;
      }

      // ── REGULAR FEED (profile-specific or all) ───────────────────────────
      const offset = reset ? 0 : offsetRef.current;

      let query = supabase
        .from("posts")
        .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
        .order("created_at", { ascending: false })
        .range(offset, offset + FEED_PAGE_SIZE - 1);

      if (profileId) {
        query = (query as typeof query).eq("profile_id", profileId);
      }

      const { data: rawPosts } = await query;
      const newPosts = (rawPosts ?? []) as PostWithProfile[];

      if (newPosts.length === 0) {
        if (reset) setPosts([]);
        setHasMore(false);
        return;
      }

      let likedIds: string[] = [];
      if (myId) {
        const { data: ld } = await supabase
          .from("likes")
          .select("post_id")
          .eq("profile_id", myId)
          .in("post_id", newPosts.map((p) => p.id));
        likedIds = ((ld ?? []) as { post_id: string }[]).map((l) => l.post_id);
      }

      const enriched = newPosts.map((p) => ({ ...p, is_liked: likedIds.includes(p.id) }));

      if (reset) {
        setPosts(enriched);
        offsetRef.current = newPosts.length;
      } else {
        setPosts((prev) => [...prev, ...enriched]);
        offsetRef.current += newPosts.length;
      }
      setHasMore(newPosts.length === FEED_PAGE_SIZE);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [getMyProfileId, profileId, mixed]);

  const refresh = useCallback(() => {
    offsetRef.current = 0;
    setHasMore(true);
    loadPosts(true);
  }, [loadPosts]);

  const updatePost = useCallback((id: string, patch: Partial<PostWithProfile>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  return { posts, loading, hasMore, currentProfileId, loadPosts, refresh, updatePost };
}
