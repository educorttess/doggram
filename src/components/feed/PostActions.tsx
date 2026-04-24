"use client";

import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

interface PostActionsProps {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  saved: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare?: () => void;
}

export function PostActions({
  liked,
  likeCount,
  commentCount,
  saved,
  onLike,
  onComment,
  onSave,
  onShare,
}: PostActionsProps) {
  return (
    <div className="px-3 pb-1">
      {/* Icon row */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-0.5">
          <button
            onClick={onLike}
            className="p-2 -ml-2 rounded-xl transition-transform duration-150 active:scale-90"
            aria-label={liked ? "Descurtir" : "Curtir"}
          >
            <Heart
              size={26}
              strokeWidth={liked ? 0 : 1.75}
              className={liked ? "fill-doggram-coral text-doggram-coral" : "text-doggram-brown-dark"}
              style={{ transition: "fill 0.15s, color 0.15s" }}
            />
          </button>

          <button
            onClick={onComment}
            className="p-2 rounded-xl transition-transform duration-150 active:scale-90"
            aria-label="Comentar"
          >
            <MessageCircle size={26} strokeWidth={1.75} className="text-doggram-brown-dark" />
          </button>

          <button
            onClick={onShare}
            className="p-2 rounded-xl transition-transform duration-150 active:scale-90"
            aria-label="Compartilhar"
          >
            <Send size={24} strokeWidth={1.75} className="text-doggram-brown-dark" />
          </button>
        </div>

        <button
          onClick={onSave}
          className="p-2 -mr-2 rounded-xl transition-transform duration-150 active:scale-90"
          aria-label={saved ? "Remover dos salvos" : "Salvar post"}
        >
          <Bookmark
            size={24}
            strokeWidth={saved ? 0 : 1.75}
            className={saved ? "fill-doggram-orange text-doggram-orange" : "text-doggram-brown-dark"}
            style={{ transition: "fill 0.15s, color 0.15s" }}
          />
        </button>
      </div>

      {/* Like count */}
      {likeCount > 0 ? (
        <p className="text-sm font-bold text-doggram-brown-dark px-0.5 pb-0.5">
          {likeCount.toLocaleString("pt-BR")} au-au{likeCount !== 1 ? "s" : ""}
        </p>
      ) : (
        <p className="text-xs text-doggram-brown-soft px-0.5 pb-0.5">
          Seja o primeiro a dar um au-au!
        </p>
      )}
    </div>
  );
}
