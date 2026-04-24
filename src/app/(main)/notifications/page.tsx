"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, UserPlus, AtSign, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";
import { useFollow } from "@/lib/hooks/useFollow";
import { formatRelativeDate } from "@/lib/utils/format";

interface NotifActor {
  id: string;
  username: string;
  dog_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

interface NotifPost {
  id: string;
  image_url: string;
}

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention";
  post_id: string | null;
  read: boolean;
  created_at: string;
  actor: NotifActor;
  post: NotifPost | null;
}

interface NotifGroup {
  label: string;
  items: Notification[];
}

function groupByPeriod(notifications: Notification[]): NotifGroup[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekAgo = todayStart.getTime() - 6 * 24 * 60 * 60 * 1000;
  const todayMs = todayStart.getTime();

  const today: Notification[] = [];
  const week: Notification[] = [];
  const older: Notification[] = [];

  for (const n of notifications) {
    const t = new Date(n.created_at).getTime();
    if (t >= todayMs) today.push(n);
    else if (t >= weekAgo) week.push(n);
    else older.push(n);
  }

  return [
    { label: "Hoje", items: today },
    { label: "Esta semana", items: week },
    { label: "Anteriores", items: older },
  ].filter((g) => g.items.length > 0);
}

const TYPE_ICONS = {
  like: <Heart size={14} className="text-doggram-coral fill-doggram-coral" />,
  comment: <MessageCircle size={14} className="text-doggram-orange fill-doggram-orange" />,
  follow: <UserPlus size={14} className="text-doggram-amber" />,
  mention: <AtSign size={14} className="text-doggram-orange" />,
};

const TYPE_TEXT = {
  like: "curtiu sua foto",
  comment: "comentou na sua foto",
  follow: "começou a te seguir",
  mention: "mencionou você em um comentário",
};

function FollowButton({ actorId }: { actorId: string }) {
  const { following, initialized, toggle } = useFollow(actorId);
  if (!initialized) return null;
  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "primary"}
      onClick={toggle}
      className="shrink-0 min-w-[80px]"
    >
      {following ? "Seguindo" : "Seguir"}
    </Button>
  );
}

function NotificationItem({ n }: { n: Notification }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${!n.read ? "bg-doggram-orange/5" : ""}`}>
      <div className="relative shrink-0">
        <Link href={`/${n.actor.username}`}>
          <Avatar src={n.actor.avatar_url} alt={n.actor.dog_name} size="md" />
        </Link>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-doggram-warm-white border border-doggram-border flex items-center justify-center">
          {TYPE_ICONS[n.type]}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-doggram-brown-dark leading-snug">
          <Link
            href={`/${n.actor.username}`}
            className="font-bold hover:text-doggram-orange transition-colors"
          >
            {n.actor.dog_name}
          </Link>
          {" "}
          <span className="font-medium">{TYPE_TEXT[n.type]}</span>
        </p>
        <p className="text-xs text-doggram-brown-soft mt-0.5">
          {formatRelativeDate(n.created_at)}
        </p>
      </div>

      {n.type === "follow" ? (
        <FollowButton actorId={n.actor.id} />
      ) : n.post ? (
        <Link href={`/post/${n.post.id}`} className="shrink-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-doggram-border">
            <Image
              src={n.post.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        </Link>
      ) : null}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-doggram-border">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <SkeletonCircle size={48} />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { profile, loading: profileLoading } = useCurrentProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      setLoading(true);
      try {
        const supabase = createClient();

        const { data } = await supabase
          .from("notifications")
          .select(`
            id, type, post_id, read, created_at,
            actor:profiles!actor_id(id, username, dog_name, avatar_url, is_verified),
            post:posts!post_id(id, image_url)
          `)
          .eq("recipient_id", profile!.id)
          .order("created_at", { ascending: false })
          .limit(60);

        if (data) {
          setNotifications(data as unknown as Notification[]);

          // Mark all unread as read
          const unreadIds = (data as unknown as Notification[])
            .filter((n) => !n.read)
            .map((n) => n.id);
          if (unreadIds.length > 0) {
            await supabase
              .from("notifications")
              .update({ read: true })
              .in("id", unreadIds);
          }
        }
      } catch {
        // Network error — leave empty state
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [profile?.id]);

  if (profileLoading || loading) return <LoadingSkeleton />;
  if (!profile) return null;

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-doggram-orange/20 to-doggram-amber/20 flex items-center justify-center mb-5">
          <Bell size={36} className="text-doggram-orange" />
        </div>
        <h3 className="text-lg font-bold text-doggram-brown-dark mb-2">Sem notificações</h3>
        <p className="text-sm text-doggram-brown-soft max-w-xs">
          Quando alguém curtir ou comentar nas fotos de {profile.dog_name}, você verá aqui.
        </p>
      </div>
    );
  }

  const groups = groupByPeriod(notifications);

  return (
    <div className="pb-4">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="px-4 py-2 bg-doggram-cream sticky top-14 z-10 border-b border-doggram-border">
            <p className="text-xs font-bold text-doggram-brown-soft uppercase tracking-wide">
              {group.label}
            </p>
          </div>
          <div className="divide-y divide-doggram-border bg-doggram-warm-white">
            {group.items.map((n) => (
              <NotificationItem key={n.id} n={n} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
