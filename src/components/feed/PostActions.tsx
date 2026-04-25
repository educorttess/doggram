"use client";

import { useState } from "react";
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
  const [bouncing, setBouncing] = useState(false);
  const [saveBouncing, setSaveBouncing] = useState(false);

  function handleLike() {
    onLike();
    setBouncing(true);
    setTimeout(() => setBouncing(false), 380);
  }

  function handleSave() {
    onSave();
    setSaveBouncing(true);
    setTimeout(() => setSaveBouncing(false), 380);
  }

  return (
    <div className="px-3 pb-1">
      {/* Icon row */}
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleLike}
            className="p-2 -ml-2 rounded-xl active:scale-90 transition-transform duration-150"
            aria-label={liked ? "Descurtir" : "Curtir"}
          >
            <Heart
              size={26}
              strokeWidth={liked ? 0 : 1.75}
              className={[
                bouncing ? "animate-like-bounce" : "",
                liked
                  ? "fill-doggram-coral text-doggram-coral"
                  : "text-doggram-brown-dark",
              ].join(" ")}
              style={{ transition: "fill 0.18s, color 0.18s" }}
            />
          </button>

          <button
            onClick={onComment}
            className="p-2 rounded-xl active:scale-90 transition-transform duration-150 hover:text-doggram-orange"
            aria-label="Comentar"
          >
            <MessageCircle size={26} strokeWidth={1.75} className="text-doggram-brown-dark" />
          </button>

          <button
            onClick={onShare}
            className="p-2 rounded-xl active:scale-90 transition-transform duration-150 hover:text-doggram-orange"
            aria-label="Compartilhar"
          >
            <Send size={24} strokeWidth={1.75} className="text-doggram-brown-dark" />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="p-2 -mr-2 rounded-xl active:scale-90 transition-transform duration-150"
          aria-label={saved ? "Remover dos salvos" : "Salvar post"}
        >
          <Bookmark
            size={24}
            strokeWidth={saved ? 0 : 1.75}
            className={[
              saveBouncing ? "animate-like-bounce" : "",
              saved
                ? "fill-doggram-orange text-doggram-orange"
                : "text-doggram-brown-dark",
            ].join(" ")}
            style={{ transition: "fill 0.18s, color 0.18s" }}
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
