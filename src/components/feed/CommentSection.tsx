"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils/format";
import type { Comment } from "@/types/post";

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  currentProfileId: string | null;
  currentProfileAvatar: string | null;
  onClose: () => void;
  onCountChange: (delta: number) => void;
}

export function CommentSection({
  postId,
  commentCount,
  currentProfileId,
  currentProfileAvatar,
  onClose,
  onCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("comments")
      .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as Comment[]);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    load();
    setTimeout(() => inputRef.current?.focus(), 350);
  }, [load]);

  async function submit() {
    if (!text.trim() || !currentProfileId || submitting) return;
    setSubmitting(true);
    const newText = text.trim();
    setText("");

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("comments")
        .insert({ post_id: postId, profile_id: currentProfileId, text: newText })
        .select("*, profile:profiles(id, username, dog_name, breed, avatar_url, is_verified)")
        .single();

      if (data) {
        setComments((prev) => [...prev, data as Comment]);
        onCountChange(1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-doggram-brown-dark/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center animate-slide-up">
        <div className="w-full max-w-lg bg-doggram-warm-white rounded-t-3xl shadow-warm-md flex flex-col max-h-[80vh]">
          {/* Handle + title */}
          <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-doggram-border shrink-0">
            <div className="w-10 h-1 rounded-full bg-doggram-border mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
            <h3 className="text-base font-bold text-doggram-brown-dark">
              Comentários
              {commentCount > 0 && (
                <span className="ml-1.5 text-doggram-brown-soft font-semibold text-sm">
                  {commentCount}
                </span>
              )}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark">
              <X size={18} />
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-doggram-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">🐾</p>
                <p className="text-sm text-doggram-brown-soft font-medium">
                  Nenhum comentário ainda.
                </p>
                <p className="text-xs text-doggram-brown-soft mt-1">
                  Seja o primeiro a comentar!
                </p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar
                    src={c.profile.avatar_url}
                    alt={c.profile.dog_name}
                    size="sm"
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-bold text-doggram-brown-dark mr-1.5">
                        {c.profile.username}
                      </span>
                      <span className="text-doggram-brown-dark">{c.text}</span>
                    </p>
                    <p className="text-xs text-doggram-brown-soft mt-0.5">
                      {formatRelativeDate(c.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          {currentProfileId && (
            <div className="flex items-center gap-3 px-4 py-3 border-t border-doggram-border shrink-0 pb-safe">
              <Avatar src={currentProfileAvatar} alt="Você" size="sm" />
              <div className="flex-1 flex items-center bg-doggram-cream border border-doggram-border rounded-2xl px-3 py-2 gap-2">
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
                  placeholder="Adicione um comentário…"
                  className="flex-1 bg-transparent text-sm text-doggram-brown-dark placeholder:text-doggram-brown-soft outline-none"
                  maxLength={500}
                />
                {text.trim() && (
                  <button
                    onClick={submit}
                    disabled={submitting}
                    className="text-doggram-orange font-bold text-sm shrink-0 transition-opacity disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
