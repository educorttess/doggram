"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Heart, Copy, Share2, Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { PostActions } from "./PostActions";
import { CommentSection } from "./CommentSection";
import { useLike } from "@/lib/hooks/useLike";
import { useSaved } from "@/lib/hooks/useSaved";
import { formatRelativeDate } from "@/lib/utils/format";
import type { PostWithProfile } from "@/types/post";

interface PostCardProps {
  post: PostWithProfile;
  currentProfileId: string | null;
  currentProfileAvatar: string | null;
  onLikeChange?: (postId: string, liked: boolean, count: number) => void;
  onCommentCountChange?: (postId: string, delta: number) => void;
}

export function PostCard({
  post,
  currentProfileId,
  currentProfileAvatar,
  onLikeChange,
  onCommentCountChange,
}: PostCardProps) {
  const { liked, count, toggle: toggleLike } = useLike(
    post.id,
    post.is_liked,
    post.likes_count,
    currentProfileId
  );
  const { saved, toggle: toggleSave } = useSaved(post.id, currentProfileId);

  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const lastTapRef = useRef(0);
  const heartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLike = useCallback(() => {
    toggleLike();
    onLikeChange?.(post.id, !liked, liked ? count - 1 : count + 1);
  }, [toggleLike, onLikeChange, post.id, liked, count]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      if (!liked) toggleLike();
      if (heartTimeoutRef.current) clearTimeout(heartTimeoutRef.current);
      setShowHeart(true);
      heartTimeoutRef.current = setTimeout(() => setShowHeart(false), 850);
    }
    lastTapRef.current = now;
  }, [liked, toggleLike]);

  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/post/${post.id}`
      : `/post/${post.id}`;

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(postUrl);
    setCopyFeedback(true);
    setTimeout(() => { setCopyFeedback(false); setShowShareMenu(false); }, 1200);
  }, [postUrl]);

  const handleWebShare = useCallback(async () => {
    try {
      await navigator.share({ title: `${post.profile.dog_name} no Doggram`, url: postUrl });
    } catch {
      // cancelled or unsupported
    }
    setShowShareMenu(false);
  }, [post.profile.dog_name, postUrl]);

  const handleCommentCountChange = useCallback(
    (delta: number) => {
      setCommentCount((c) => c + delta);
      onCommentCountChange?.(post.id, delta);
    },
    [onCommentCountChange, post.id]
  );

  const caption = post.caption ?? "";
  const isLongCaption = caption.length > 120;
  const displayCaption =
    isLongCaption && !captionExpanded ? caption.slice(0, 120) + "…" : caption;

  return (
    <>
      <article className="bg-doggram-warm-white border-b border-doggram-border">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <Link
            href={`/${post.profile.username}`}
            className="flex items-center gap-2.5 group"
          >
            {/* Gradient border on every post avatar */}
            <Avatar
              src={post.profile.avatar_url}
              alt={post.profile.dog_name}
              size="md"
              gradientBorder
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-doggram-brown-dark leading-tight group-hover:text-doggram-orange transition-colors">
                  {post.profile.dog_name}
                </span>
                {post.profile.is_verified && (
                  <Badge variant="verified">Pro</Badge>
                )}
                {post.is_suggested && (
                  <span className="text-[10px] font-semibold text-doggram-brown-soft bg-doggram-surface border border-doggram-border rounded-full px-2 py-0.5">
                    Sugerido
                  </span>
                )}
              </div>
              {post.profile.breed && (
                <span className="text-xs text-doggram-brown-soft font-medium">
                  {post.profile.breed}
                </span>
              )}
            </div>
          </Link>

          <button className="p-2 -mr-1 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark hover:bg-doggram-surface transition-all duration-150 active:scale-90">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* ── Image (1:1) ── */}
        <div
          className="relative aspect-square w-full bg-doggram-surface overflow-hidden cursor-pointer select-none"
          onClick={handleDoubleTap}
        >
          <Image
            src={post.image_url}
            alt={caption || `Foto de ${post.profile.dog_name}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.02]"
            sizes="(max-width: 512px) 100vw, 512px"
            priority={false}
          />

          {/* Double-tap heart overlay */}
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart
                size={96}
                className="animate-heart-pop text-doggram-coral fill-doggram-coral drop-shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <PostActions
          liked={liked}
          likeCount={count}
          commentCount={commentCount}
          saved={saved}
          onLike={handleLike}
          onComment={() => setShowComments(true)}
          onSave={toggleSave}
          onShare={() => setShowShareMenu(true)}
        />

        {/* ── Share menu ── */}
        {showShareMenu && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShareMenu(false)}
          >
            <div
              className="w-full max-w-sm mx-3 mb-6 rounded-2xl overflow-hidden bg-doggram-surface border border-doggram-border shadow-warm-md animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center text-sm font-bold text-doggram-brown-dark pt-4 pb-2 border-b border-doggram-border">
                Compartilhar post
              </p>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-3 w-full px-5 py-4 text-sm font-semibold text-doggram-brown-dark hover:bg-doggram-warm-white transition-colors border-b border-doggram-border"
              >
                {copyFeedback ? (
                  <Check size={20} className="text-doggram-success" />
                ) : (
                  <Copy size={20} className="text-doggram-brown-soft" />
                )}
                {copyFeedback ? "Link copiado!" : "Copiar link"}
              </button>

              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleWebShare}
                  className="flex items-center gap-3 w-full px-5 py-4 text-sm font-semibold text-doggram-brown-dark hover:bg-doggram-warm-white transition-colors border-b border-doggram-border"
                >
                  <Share2 size={20} className="text-doggram-brown-soft" />
                  Compartilhar via…
                </button>
              )}

              <button
                onClick={() => setShowShareMenu(false)}
                className="w-full py-4 text-sm font-bold text-doggram-brown-soft hover:text-doggram-brown-dark transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ── Caption ── */}
        {caption && (
          <div className="px-4 pb-1">
            <p className="text-sm text-doggram-brown-dark leading-snug">
              <span className="font-bold mr-1.5">{post.profile.username}</span>
              {displayCaption}
              {isLongCaption && !captionExpanded && (
                <button
                  onClick={() => setCaptionExpanded(true)}
                  className="ml-1 text-doggram-brown-soft font-semibold hover:text-doggram-orange transition-colors"
                >
                  ver mais
                </button>
              )}
            </p>
          </div>
        )}

        {/* ── Comments link ── */}
        {commentCount > 0 && (
          <button
            onClick={() => setShowComments(true)}
            className="px-4 pb-1 text-sm text-doggram-brown-soft font-medium hover:text-doggram-orange transition-colors"
          >
            Ver todos os {commentCount} comentário{commentCount !== 1 ? "s" : ""}
          </button>
        )}

        {/* ── Timestamp ── */}
        <p className="px-4 pb-3 text-[11px] text-doggram-brown-soft uppercase tracking-wide font-semibold">
          {formatRelativeDate(post.created_at)}
        </p>
      </article>

      {/* ── Comments modal ── */}
      {showComments && (
        <CommentSection
          postId={post.id}
          commentCount={commentCount}
          currentProfileId={currentProfileId}
          currentProfileAvatar={currentProfileAvatar}
          onClose={() => setShowComments(false)}
          onCountChange={handleCommentCountChange}
        />
      )}
    </>
  );
}
