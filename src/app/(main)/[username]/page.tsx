"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck, Grid3X3, MessageCircle } from "lucide-react";
import { FollowListModal } from "@/components/shared/FollowListModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { formatCount } from "@/lib/utils/format";
import { useFollow } from "@/lib/hooks/useFollow";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/profile";
import type { Post } from "@/types/post";

async function findOrCreateConversation(
  myProfileId: string,
  otherProfileId: string
): Promise<string> {
  const supabase = createClient();

  // Find existing conversation between the two
  const { data: myConvs } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("profile_id", myProfileId);

  const { data: theirConvs } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("profile_id", otherProfileId);

  const myIds = new Set((myConvs ?? []).map((c: { conversation_id: string }) => c.conversation_id));
  const shared = (theirConvs ?? []).find((c: { conversation_id: string }) => myIds.has(c.conversation_id));
  if (shared) return shared.conversation_id;

  // Create new conversation
  const { data: conv } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  await supabase.from("conversation_members").insert([
    { conversation_id: conv!.id, profile_id: myProfileId },
    { conversation_id: conv!.id, profile_id: otherProfileId },
  ]);

  return conv!.id;
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username as string;
  const router = useRouter();

  const { profile: myProfile } = useCurrentProfile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [startingChat, setStartingChat] = useState(false);
  const [followModal, setFollowModal] = useState<"followers" | "following" | null>(null);

  const { following, initialized: followInit, toggle: toggleFollow } = useFollow(
    profile?.id ?? ""
  );

  useEffect(() => {
    if (!username) return;
    async function fetchProfile() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (!data) {
          setNotFound(true);
          return;
        }
        setProfile(data as Profile);
        setFollowersCount((data as Profile).followers_count);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

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

  const handleFollow = useCallback(async () => {
    const wasFollowing = following;
    await toggleFollow();
    setFollowersCount((c) => (wasFollowing ? c - 1 : c + 1));
  }, [following, toggleFollow]);

  const isOwnProfile = !!myProfile && !!profile && myProfile.id === profile.id;

  async function handleMessage() {
    if (!myProfile || !profile) return;
    setStartingChat(true);
    try {
      const convId = await findOrCreateConversation(myProfile.id, profile.id);
      router.push(`/messages/${convId}`);
    } finally {
      setStartingChat(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="px-4 pt-5 pb-4 bg-doggram-warm-white border-b border-doggram-border">
          <div className="flex items-start gap-4">
            <SkeletonCircle size={80} />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-14 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-9 w-full mt-4 rounded-2xl" />
        </div>
        <div className="grid grid-cols-3 gap-px bg-doggram-border mt-px">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-5xl mb-4">🐾</p>
        <h3 className="text-lg font-bold text-doggram-brown-dark mb-2">Dog não encontrado</h3>
        <p className="text-sm text-doggram-brown-soft mb-5">@{username} não existe por aqui.</p>
        <Link href="/explore">
          <Button variant="secondary">Explorar dogs</Button>
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="pb-4">
      {followModal && profile && (
        <FollowListModal
          profileId={profile.id}
          type={followModal}
          title={followModal === "followers" ? "Seguidores" : "Seguindo"}
          onClose={() => setFollowModal(null)}
        />
      )}
      {/* ── Header ── */}
      <div className="bg-doggram-warm-white border-b border-doggram-border px-4 pt-5 pb-4">
        <div className="flex items-start gap-4 mb-3">
          <Avatar src={profile.avatar_url} alt={profile.dog_name} size="xl" />
          <div className="pt-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black text-doggram-brown-dark leading-tight">
                {profile.dog_name}
              </h1>
              {profile.is_verified && (
                <BadgeCheck size={18} className="text-doggram-orange fill-doggram-amber shrink-0" />
              )}
            </div>
            <p className="text-sm text-doggram-brown-soft font-semibold">@{profile.username}</p>
            {profile.breed && (
              <Badge variant="breed" className="mt-1.5">{profile.breed}</Badge>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-doggram-brown-dark leading-snug mb-3">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-2 mb-4">
          {[
            { label: "posts", value: posts.length, onClick: null },
            { label: "seguidores", value: followersCount, onClick: () => setFollowModal("followers") },
            { label: "seguindo", value: profile.following_count, onClick: () => setFollowModal("following") },
          ].map((s) =>
            s.onClick ? (
              <button
                key={s.label}
                onClick={s.onClick}
                className="flex-1 bg-doggram-cream rounded-2xl py-2.5 px-1 text-center hover:bg-doggram-border/50 transition-colors active:scale-95"
              >
                <p className="text-lg font-black text-doggram-brown-dark leading-tight">
                  {formatCount(s.value)}
                </p>
                <p className="text-xs text-doggram-brown-soft font-semibold">{s.label}</p>
              </button>
            ) : (
              <div key={s.label} className="flex-1 bg-doggram-cream rounded-2xl py-2.5 px-1 text-center">
                <p className="text-lg font-black text-doggram-brown-dark leading-tight">
                  {formatCount(s.value)}
                </p>
                <p className="text-xs text-doggram-brown-soft font-semibold">{s.label}</p>
              </div>
            )
          )}
        </div>

        {/* Action buttons */}
        {isOwnProfile ? (
          <Link href="/edit-profile">
            <Button variant="secondary" fullWidth size="sm">Editar perfil</Button>
          </Link>
        ) : (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              variant={following ? "secondary" : "primary"}
              onClick={handleFollow}
              disabled={!followInit}
            >
              {following ? "Seguindo ✓" : "Seguir"}
            </Button>
            {myProfile && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMessage}
                loading={startingChat}
                className="px-3"
                aria-label="Enviar mensagem"
              >
                <MessageCircle size={16} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Grid tab ── */}
      <div className="flex border-b border-doggram-border bg-doggram-warm-white">
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
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <p className="text-5xl mb-4">📸</p>
          <h3 className="text-base font-bold text-doggram-brown-dark mb-2">Nenhuma foto ainda</h3>
          <p className="text-sm text-doggram-brown-soft">{profile.dog_name} ainda não postou.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-doggram-border">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="relative aspect-square block bg-doggram-border group overflow-hidden"
            >
              <Image
                src={post.image_url}
                alt="Post"
                fill
                className="object-cover group-hover:opacity-90 transition-opacity"
                sizes="33vw"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
