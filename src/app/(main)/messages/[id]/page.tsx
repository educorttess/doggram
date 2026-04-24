"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { formatRelativeDate } from "@/lib/utils/format";

interface OtherProfile {
  id: string;
  username: string;
  dog_name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
}

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params?.id as string;
  const router = useRouter();
  const { profile, loading: profileLoading } = useCurrentProfile();

  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!profile || !conversationId) return;

    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        // Verify this profile is a member of the conversation
        const { data: membership } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("conversation_id", conversationId)
          .eq("profile_id", profile!.id)
          .maybeSingle();

        if (!membership) {
          router.replace("/messages");
          return;
        }

        // Get the other participant
        const { data: otherMember } = await supabase
          .from("conversation_members")
          .select("profile:profiles!profile_id(id, username, dog_name, avatar_url)")
          .eq("conversation_id", conversationId)
          .neq("profile_id", profile!.id)
          .maybeSingle();

        if (otherMember) {
          setOtherProfile((otherMember as unknown as { profile: OtherProfile }).profile);
        }

        // Fetch messages
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, text, created_at, sender_id")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        setMessages((msgs ?? []) as Message[]);
      } catch {
        // Network error — show empty state, let user navigate away
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile?.id, conversationId, router]);

  // Real-time subscription
  useEffect(() => {
    if (!profile || !conversationId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const msg = payload.new as unknown as Message;
          // Avoid duplicates (our own optimistic messages)
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, conversationId]);

  const sendMessage = useCallback(async () => {
    if (!text.trim() || !profile || sending) return;
    const msgText = text.trim();
    setText("");
    setSending(true);

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      text: msgText,
      created_at: new Date().toISOString(),
      sender_id: profile.id,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: profile.id, text: msgText })
        .select("id, text, created_at, sender_id")
        .single();

      if (data) {
        // Replace temp message with real one
        setMessages((prev) => prev.map((m) => (m.id === tempId ? (data as Message) : m)));
      }
    } catch {
      // Revert optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setText(msgText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [text, profile, sending, conversationId]);

  if (profileLoading || loading) {
    return (
      <div className="flex flex-col h-[calc(100dvh-7.5rem)]">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 px-4 py-3 bg-doggram-warm-white border-b border-doggram-border">
          <SkeletonCircle size={40} />
          <Skeleton className="h-4 w-28" />
        </div>
        {/* Messages skeleton */}
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
              <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-doggram-warm-white border-b border-doggram-border shrink-0">
        <button
          onClick={() => router.push("/messages")}
          className="p-1.5 -ml-1 rounded-xl text-doggram-brown-soft hover:text-doggram-orange transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        {otherProfile && (
          <>
            <Avatar src={otherProfile.avatar_url} alt={otherProfile.dog_name} size="sm" />
            <div>
              <p className="text-sm font-bold text-doggram-brown-dark leading-tight">
                {otherProfile.dog_name}
              </p>
              <p className="text-xs text-doggram-brown-soft">@{otherProfile.username}</p>
            </div>
          </>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <p className="text-3xl">🐾</p>
            <p className="text-sm text-doggram-brown-soft font-medium">
              Nenhuma mensagem ainda.<br />Diga olá!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === profile.id;
            const showTime =
              i === messages.length - 1 ||
              new Date(messages[i + 1]?.created_at).getTime() -
                new Date(msg.created_at).getTime() > 5 * 60 * 1000;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-snug ${
                    isMe
                      ? "bg-gradient-to-br from-doggram-orange to-doggram-amber text-white rounded-br-md"
                      : "bg-doggram-warm-white border border-doggram-border text-doggram-brown-dark rounded-bl-md"
                  } ${msg.id.startsWith("temp-") ? "opacity-70" : ""}`}
                >
                  {msg.text}
                </div>
                {showTime && (
                  <p className="text-[10px] text-doggram-brown-soft mt-1 px-1">
                    {formatRelativeDate(msg.created_at)}
                  </p>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-t border-doggram-border bg-doggram-warm-white shrink-0 pb-safe">
        <Avatar src={profile.avatar_url} alt={profile.dog_name} size="sm" />
        <div className="flex-1 flex items-center bg-doggram-cream border border-doggram-border rounded-2xl px-3 py-2 gap-2 focus-within:border-doggram-orange focus-within:ring-2 focus-within:ring-doggram-orange/20 transition-all">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Mensagem…"
            className="flex-1 bg-transparent text-sm text-doggram-brown-dark placeholder:text-doggram-brown-soft outline-none"
            maxLength={1000}
          />
        </div>
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="w-9 h-9 rounded-2xl bg-gradient-to-br from-doggram-orange to-doggram-amber flex items-center justify-center text-white disabled:opacity-40 transition-opacity active:scale-95"
          aria-label="Enviar"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
