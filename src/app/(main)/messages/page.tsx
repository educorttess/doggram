"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { formatRelativeDate } from "@/lib/utils/format";

interface ConversationItem {
  id: string;
  otherProfile: {
    id: string;
    username: string;
    dog_name: string;
    avatar_url: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastSenderIsMe: boolean;
}

export default function MessagesPage() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        // Get all conversation IDs I'm part of
        const { data: myMemberships } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("profile_id", profile!.id);

        const convIds: string[] = (myMemberships ?? []).map((m: { conversation_id: string }) => m.conversation_id);

        if (convIds.length === 0) {
          setConversations([]);
          return;
        }

        // Get the other member in each conversation
        const { data: otherMembers } = await supabase
          .from("conversation_members")
          .select("conversation_id, profile:profiles!profile_id(id, username, dog_name, avatar_url)")
          .in("conversation_id", convIds)
          .neq("profile_id", profile!.id);

        // Get last message per conversation
        const { data: messages } = await supabase
          .from("messages")
          .select("conversation_id, text, created_at, sender_id")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false });

        // Build conversation items
        const lastMsgMap = new Map<string, { text: string; at: string; senderId: string }>();
        for (const msg of messages ?? []) {
          if (!lastMsgMap.has(msg.conversation_id)) {
            lastMsgMap.set(msg.conversation_id, {
              text: msg.text,
              at: msg.created_at,
              senderId: msg.sender_id,
            });
          }
        }

        const otherMap = new Map<string, ConversationItem["otherProfile"]>();
        for (const m of (otherMembers ?? []) as unknown as {
          conversation_id: string;
          profile: ConversationItem["otherProfile"];
        }[]) {
          otherMap.set(m.conversation_id, m.profile);
        }

        const items: ConversationItem[] = convIds
          .filter((id) => otherMap.has(id))
          .map((id) => {
            const last = lastMsgMap.get(id);
            return {
              id,
              otherProfile: otherMap.get(id)!,
              lastMessage: last?.text ?? null,
              lastMessageAt: last?.at ?? null,
              lastSenderIsMe: last?.senderId === profile!.id,
            };
          })
          .sort((a, b) => {
            if (!a.lastMessageAt) return 1;
            if (!b.lastMessageAt) return -1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          });

        setConversations(items);
      } catch {
        // Network error — show empty state
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile?.id]);

  if (profileLoading || loading) {
    return (
      <div className="divide-y divide-doggram-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <SkeletonCircle size={52} />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (!profile) return null;

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-doggram-orange/20 to-doggram-amber/20 flex items-center justify-center mb-5">
          <MessageCircle size={36} className="text-doggram-orange" />
        </div>
        <h3 className="text-lg font-bold text-doggram-brown-dark mb-2">Sem mensagens ainda</h3>
        <p className="text-sm text-doggram-brown-soft max-w-xs leading-snug">
          Visite o perfil de outro dog e toque em{" "}
          <span className="font-bold text-doggram-orange">Enviar mensagem</span> para começar uma conversa.
        </p>
        <Link
          href="/explore"
          className="mt-5 text-sm font-bold text-doggram-orange hover:underline"
        >
          Explorar dogs →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-doggram-border">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/messages/${conv.id}`}
          className="flex items-center gap-3 px-4 py-3 bg-doggram-warm-white hover:bg-doggram-cream transition-colors"
        >
          <Avatar src={conv.otherProfile.avatar_url} alt={conv.otherProfile.dog_name} size="md" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-doggram-brown-dark truncate">
              {conv.otherProfile.dog_name}
            </p>
            <p className="text-xs text-doggram-brown-soft truncate mt-0.5">
              {conv.lastMessage
                ? `${conv.lastSenderIsMe ? "Você: " : ""}${conv.lastMessage}`
                : "Nenhuma mensagem ainda"}
            </p>
          </div>

          {conv.lastMessageAt && (
            <span className="text-[11px] text-doggram-brown-soft shrink-0">
              {formatRelativeDate(conv.lastMessageAt)}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
