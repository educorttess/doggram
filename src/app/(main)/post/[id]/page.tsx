"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Send, Heart } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PostActions } from "@/components/feed/PostActions";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { formatRelativeDate } from "@/lib/utils/format";
import { useLike } from "@/lib/hooks/useLike";
import { useSaved } from "@/lib/hooks/useSaved";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { createClient } from "@/lib/supabase/client";
import type { PostWithProfile, Comment } from "@/types/post";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id as string;

  const { profile: myProfile } = useCurrentProfile();
  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!postId) return;
    async function fetchPost() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id ?? null;
        let myProfileId: string | null = null;

        if (userId) {
          const { data: pd } = await supabase
            .from("profiles")
            .select("id")
            .eq("owner_id", userId)
            .maybeSingle();
          myProfileId = (pd as { id: string } | null)?.id ?? null;
        }

        const { data } = await supabase
          .from("posts")
          .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
          .eq("id", postId)
          .maybeSingle();

        if (!data) {
          setNotFound(true);
          return;
        }

        let isLiked = false;
        if (myProfileId) {
          const { data: likeData } = await supabase
            .from("likes")
            .select("id")
            .eq("profile_id", myProfileId)
            .eq("post_id", postId)
            .maybeSingle();
          isLiked = !!likeData;
        }

        const enriched = { ...data, is_liked: isLiked, profile: data.profile } as PostWithProfile;
        setPost(enriched);
        setCommentCount(enriched.comments_count);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    async function fetchComments() {
      setCommentsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("comments")
          .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
          .eq("post_id", postId)
          .order("created_at", { ascending: true });
        setComments((data ?? []) as Comment[]);
      } catch {
        // Network error — show empty comments
      } finally {
        setCommentsLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  const { liked, count: likeCount, toggle: toggleLike } = useLike(
    postId,
    post?.is_liked ?? false,
    post?.likes_count ?? 0,
    myProfile?.id ?? null
  );
  const { saved, toggle: toggleSave } = useSaved(postId, myProfile?.id ?? null);

  const submitComment = useCallback(async () => {
    if (!commentText.trim() || !myProfile || submitting) return;
    setSubmitting(true);
    const newText = commentText.trim();
    setCommentText("");

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("comments")
        .insert({ post_id: postId, profile_id: myProfile.id, text: newText })
        .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
        .single();

      if (data) {
        setComments((prev) => [...prev, data as Comment]);
        setCommentCount((c) => c + 1);
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } finally {
      setSubmitting(false);
    }
  }, [commentText, myProfile, submitting, postId]);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="sticky top-14 z-10 bg-doggram-warm-white border-b border-doggram-border px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-xl" />
          <SkeletonCircle size={32} />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="px-4 py-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <p className="text-5xl mb-4">📸</p>
        <h3 className="text-lg font-bold text-doggram-brown-dark mb-2">Post não encontrado</h3>
        <p className="text-sm text-doggram-brown-soft mb-5">Este post pode ter sido removido.</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-doggram-orange"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* ── Top bar ── */}
      <div className="sticky top-14 z-10 bg-doggram-warm-white border-b border-doggram-border px-3 py-2.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark hover:bg-doggram-cream transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <Link href={`/${post.profile.username}`} className="flex items-center gap-2.5">
          <Avatar src={post.profile.avatar_url} alt={post.profile.dog_name} size="sm" />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-doggram-brown-dark leading-tight">
                {post.profile.dog_name}
              </span>
              {post.profile.is_verified && (
                <BadgeCheck size={14} className="text-doggram-orange fill-doggram-amber" />
              )}
            </div>
            {post.profile.breed && (
              <p className="text-xs text-doggram-brown-soft">{post.profile.breed}</p>
            )}
          </div>
        </Link>
      </div>

      {/* ── Image ── */}
      <div className="relative aspect-square w-full bg-doggram-border">
        <Image
          src={post.image_url}
          alt={post.caption || `Foto de ${post.profile.dog_name}`}
          fill
          className="object-cover"
          sizes="(max-width: 512px) 100vw, 512px"
          priority
        />
      </div>

      {/* ── Actions ── */}
      <div className="bg-doggram-warm-white border-b border-doggram-border">
        <PostActions
          liked={liked}
          likeCount={likeCount}
          commentCount={commentCount}
          saved={saved}
          onLike={toggleLike}
          onComment={() => inputRef.current?.focus()}
          onSave={toggleSave}
        />

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-2">
            <p className="text-sm text-doggram-brown-dark leading-snug">
              <Link
                href={`/${post.profile.username}`}
                className="font-bold mr-1.5 hover:underline"
              >
                {post.profile.username}
              </Link>
              {post.caption}
            </p>
          </div>
        )}

        <p className="px-4 pb-3 text-[11px] text-doggram-brown-soft uppercase tracking-wide font-semibold">
          {formatRelativeDate(post.created_at)}
        </p>
      </div>

      {/* ── Comments ── */}
      <div className="bg-doggram-warm-white">
        <div className="px-4 py-3 border-b border-doggram-border">
          <p className="text-xs font-bold text-doggram-brown-soft uppercase tracking-wide">
            Comentários{commentCount > 0 ? ` (${commentCount})` : ""}
          </p>
        </div>

        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-doggram-orange border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 px-6">
            <p className="text-3xl mb-2">🐾</p>
            <p className="text-sm text-doggram-brown-soft font-medium">Nenhum comentário ainda.</p>
            <p className="text-xs text-doggram-brown-soft mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="divide-y divide-doggram-border">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 px-4 py-3">
                <Link href={`/${c.profile.username}`} className="shrink-0">
                  <Avatar src={c.profile.avatar_url} alt={c.profile.dog_name} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-doggram-brown-dark leading-snug">
                    <Link
                      href={`/${c.profile.username}`}
                      className="font-bold mr-1.5 hover:underline"
                    >
                      {c.profile.username}
                    </Link>
                    {c.text}
                  </p>
                  <p className="text-xs text-doggram-brown-soft mt-0.5">
                    {formatRelativeDate(c.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* ── Comment input (fixed at bottom) ── */}
      {myProfile && (
        <div className="fixed bottom-16 left-0 right-0 z-30 flex justify-center border-t border-doggram-border bg-doggram-warm-white">
          <div className="w-full max-w-lg flex items-center gap-3 px-4 py-2.5 pb-safe">
            <Avatar src={myProfile.avatar_url} alt={myProfile.dog_name} size="sm" />
            <div className="flex-1 flex items-center bg-doggram-cream border border-doggram-border rounded-2xl px-3 py-2 gap-2 focus-within:border-doggram-orange focus-within:ring-2 focus-within:ring-doggram-orange/20 transition-all">
              <input
                ref={inputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                placeholder="Adicione um comentário…"
                className="flex-1 bg-transparent text-sm text-doggram-brown-dark placeholder:text-doggram-brown-soft outline-none"
                maxLength={500}
              />
              {commentText.trim() && (
                <button
                  onClick={submitComment}
                  disabled={submitting}
                  className="text-doggram-orange transition-opacity disabled:opacity-50 shrink-0"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
