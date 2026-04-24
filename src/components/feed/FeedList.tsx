"use client";

import { useEffect, useCallback } from "react";
import { PostCard } from "./PostCard";
import { SuggestedDogs } from "./SuggestedDogs";
import { SkeletonPostCard } from "@/components/ui/Skeleton";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { usePosts } from "@/lib/hooks/usePosts";
import type { Profile } from "@/types/profile";

interface FeedListProps {
  currentProfile: Profile | null;
  profileId?: string;
}

// Inject the SuggestedDogs block after this post index
const SUGGESTED_DOGS_AFTER = 3;

export function FeedList({ currentProfile, profileId }: FeedListProps) {
  const isMixedFeed = !profileId;
  const { posts, loading, hasMore, currentProfileId, loadPosts, updatePost } = usePosts({
    profileId,
    mixed: isMixedFeed,
  });

  useEffect(() => {
    loadPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) loadPosts();
  }, [loading, hasMore, loadPosts]);

  const sentinelRef = useInfiniteScroll(handleLoadMore);

  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-5xl mb-4">🐾</p>
        <h3 className="text-lg font-bold text-doggram-brown-dark mb-2">
          {profileId ? "Nenhum post ainda" : "O feed está vazio"}
        </h3>
        <p className="text-sm text-doggram-brown-soft">
          {profileId
            ? "Quando houver fotos, elas aparecerão aqui."
            : "Siga outros dogs para ver as fotos deles aqui!"}
        </p>
        {!profileId && (
          <SuggestedDogs currentProfileId={currentProfile?.id ?? currentProfileId} />
        )}
      </div>
    );
  }

  const resolvedProfileId = currentProfile?.id ?? currentProfileId;

  return (
    <div>
      {posts.map((post, index) => (
        <div key={post.id}>
          <PostCard
            post={post}
            currentProfileId={resolvedProfileId}
            currentProfileAvatar={currentProfile?.avatar_url ?? null}
            onLikeChange={(id, liked, count) =>
              updatePost(id, { is_liked: liked, likes_count: count })
            }
            onCommentCountChange={(id, delta) =>
              updatePost(id, {
                comments_count: (posts.find((p) => p.id === id)?.comments_count ?? 0) + delta,
              })
            }
          />
          {/* Inject suggested dogs block after N-th post on the main feed */}
          {isMixedFeed && index === SUGGESTED_DOGS_AFTER - 1 && (
            <SuggestedDogs currentProfileId={resolvedProfileId} />
          )}
        </div>
      ))}

      {loading && posts.length === 0 && (
        <div className="space-y-0 divide-y divide-doggram-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonPostCard key={i} />
          ))}
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-16" />}

      {loading && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-doggram-orange border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-10">
          <p className="text-2xl mb-2">🐶</p>
          <p className="text-sm text-doggram-brown-soft font-medium">
            Você chegou ao fim! Que tal seguir mais dogs?
          </p>
        </div>
      )}
    </div>
  );
}
