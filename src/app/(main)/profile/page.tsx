"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Grid3X3, BadgeCheck } from "lucide-react";
import { XPBar } from "@/components/engagement/XPBar";
import { LevelBadge } from "@/components/engagement/LevelBadge";
import { FollowListModal } from "@/components/shared/FollowListModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { formatCount } from "@/lib/utils/format";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/post";

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    if (!profile) return;
    async function fetchPosts() {
      setPostsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("posts")
          .select("*")
          .eq("profile_id", profile!.id)
          .order("created_at", { ascending: false });
        setPosts((data ?? []) as Post[]);
      } catch {
        // Network error — show empty grid
      } finally {
        setPostsLoading(false);
      }
    }
    fetchPosts();
  }, [profile]);

  /* ── Loading skeleton ── */
  if (profileLoading) {
    return (
      <div className="animate-fade-in">
        {/* Cover skeleton */}
        <Skeleton className="h-28 w-full rounded-none" />
        <div className="px-4 -mt-10 mb-4">
          <SkeletonCircle size={88} />
        </div>
        <div className="px-4 space-y-2 mb-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="flex gap-3 px-4 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-14 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-px bg-doggram-border mt-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  /* ── No profile ── */
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-4xl mb-4">🐾</p>
        <h3 className="text-lg font-bold text-doggram-brown-dark mb-2">
          Sem perfil ainda
        </h3>
        <p className="text-sm text-doggram-brown-soft mb-5">
          Crie o perfil do seu dog para começar!
        </p>
        <Link href="/setup-profile">
          <Button>Criar perfil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-4">
      {followModal && (
        <FollowListModal
          profileId={profile.id}
          type={followModal}
          title={followModal === "followers" ? "Seguidores" : "Seguindo"}
          onClose={() => setFollowModal(null)}
        />
      )}

      {/* ── Cover ── */}
      <div className="relative h-28 overflow-hidden bg-doggram-surface">
        <div className="absolute inset-0 bg-gradient-to-br from-doggram-orange/40 via-doggram-amber/25 to-doggram-surface" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,140,66,0.3),transparent_60%)]" />
        {/* Settings icon in cover */}
        <Link href="/edit-profile" className="absolute top-3 right-3">
          <button className="p-2 rounded-xl bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors active:scale-90">
            <Settings size={18} />
          </button>
        </Link>
      </div>

      {/* ── Avatar overlapping cover ── */}
      <div className="px-4 -mt-11 flex items-end justify-between mb-3">
        <div className="p-1 rounded-full bg-doggram-cream">
          <Avatar src={profile.avatar_url} alt={profile.dog_name} size="xl" />
        </div>
        <Link href="/edit-profile" className="mb-1">
          <Button variant="secondary" size="sm">
            Editar perfil
          </Button>
        </Link>
      </div>

      {/* ── Name / username / breed ── */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h1 className="text-xl font-black text-doggram-brown-dark">
            {profile.dog_name}
          </h1>
          {profile.is_verified && (
            <BadgeCheck size={18} className="text-doggram-orange fill-doggram-amber" />
          )}
          <LevelBadge xp={profile.xp ?? 0} size="sm" />
        </div>
        <p className="text-sm text-doggram-brown-soft font-semibold">
          @{profile.username}
        </p>
        {profile.breed && (
          <Badge variant="breed" className="mt-1.5">
            {profile.breed}
          </Badge>
        )}
        {profile.bio && (
          <p className="text-sm text-doggram-brown-dark leading-snug mt-2">
            {profile.bio}
          </p>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="flex gap-2 px-4 mb-3">
        {[
          { label: "posts",      value: posts.length,            onClick: null },
          { label: "seguidores", value: profile.followers_count, onClick: () => setFollowModal("followers") },
          { label: "seguindo",   value: profile.following_count, onClick: () => setFollowModal("following") },
        ].map((s) =>
          s.onClick ? (
            <button
              key={s.label}
              onClick={s.onClick}
              className="flex-1 bg-doggram-surface rounded-2xl py-2.5 px-1 text-center hover:bg-doggram-border/50 transition-colors active:scale-95"
            >
              <p className="text-lg font-black text-doggram-brown-dark leading-tight">
                {formatCount(s.value)}
              </p>
              <p className="text-xs text-doggram-brown-soft font-semibold">{s.label}</p>
            </button>
          ) : (
            <div
              key={s.label}
              className="flex-1 bg-doggram-surface rounded-2xl py-2.5 px-1 text-center"
            >
              <p className="text-lg font-black text-doggram-brown-dark leading-tight">
                {formatCount(s.value)}
              </p>
              <p className="text-xs text-doggram-brown-soft font-semibold">{s.label}</p>
            </div>
          )
        )}
      </div>

      {/* ── XP bar ── */}
      <div className="px-4 mb-1">
        <XPBar xp={profile.xp ?? 0} quizStreak={profile.quiz_streak ?? 0} linkToAchievements />
      </div>

      {/* ── Grid tab bar ── */}
      <div className="flex border-b border-doggram-border bg-doggram-warm-white mt-2">
        <button className="flex-1 py-2.5 flex items-center justify-center text-doggram-orange border-b-2 border-doggram-orange">
          <Grid3X3 size={20} />
        </button>
      </div>

      {/* ── Photo grid ── */}
      {postsLoading ? (
        <div className="grid grid-cols-3 gap-px bg-doggram-border">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-none" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
          <p className="text-5xl mb-4">📸</p>
          <h3 className="text-base font-bold text-doggram-brown-dark mb-2">
            Nenhuma foto ainda
          </h3>
          <p className="text-sm text-doggram-brown-soft mb-5">
            Compartilhe a primeira foto do {profile.dog_name}!
          </p>
          <Link href="/create">
            <Button size="sm">Criar post</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-doggram-border">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="relative aspect-square block bg-doggram-surface group overflow-hidden"
            >
              <Image
                src={post.image_url}
                alt="Post"
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-90"
                sizes="33vw"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
