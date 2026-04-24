"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";
import { useFollow } from "@/lib/hooks/useFollow";
import { createClient } from "@/lib/supabase/client";

interface FollowProfile {
  id: string;
  username: string;
  dog_name: string;
  breed: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

interface FollowListModalProps {
  profileId: string;
  type: "followers" | "following";
  title: string;
  onClose: () => void;
}

function FollowRow({ profile, onClose }: { profile: FollowProfile; onClose: () => void }) {
  const { following, initialized, toggle } = useFollow(profile.id);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Link href={`/${profile.username}`} onClick={onClose}>
        <Avatar src={profile.avatar_url} alt={profile.dog_name} size="md" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/${profile.username}`} onClick={onClose}>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-doggram-brown-dark hover:text-doggram-orange transition-colors truncate">
              {profile.dog_name}
            </span>
            {profile.is_verified && <Badge variant="verified">Pro</Badge>}
          </div>
          <p className="text-xs text-doggram-brown-soft">@{profile.username}</p>
        </Link>
        {profile.breed && (
          <Badge variant="breed" className="mt-0.5">{profile.breed}</Badge>
        )}
      </div>
      {initialized && (
        <Button
          size="sm"
          variant={following ? "secondary" : "primary"}
          className="shrink-0 min-w-[80px]"
          onClick={toggle}
        >
          {following ? "Seguindo" : "Seguir"}
        </Button>
      )}
    </div>
  );
}

export function FollowListModal({ profileId, type, title, onClose }: FollowListModalProps) {
  const [profiles, setProfiles] = useState<FollowProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();

      if (type === "followers") {
        const { data } = await supabase
          .from("follows")
          .select("follower:profiles!follower_id(id, username, dog_name, breed, avatar_url, is_verified)")
          .eq("following_id", profileId)
          .order("created_at", { ascending: false })
          .limit(100);
        setProfiles(
          ((data ?? []) as unknown as { follower: FollowProfile }[]).map((r) => r.follower)
        );
      } else {
        const { data } = await supabase
          .from("follows")
          .select("following:profiles!following_id(id, username, dog_name, breed, avatar_url, is_verified)")
          .eq("follower_id", profileId)
          .order("created_at", { ascending: false })
          .limit(100);
        setProfiles(
          ((data ?? []) as unknown as { following: FollowProfile }[]).map((r) => r.following)
        );
      }

      setLoading(false);
    }

    load();
  }, [profileId, type]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-doggram-brown-dark/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center animate-slide-up">
        <div className="w-full max-w-lg bg-doggram-warm-white rounded-t-3xl shadow-warm-md flex flex-col max-h-[80vh]">
          {/* Handle + title */}
          <div className="relative flex items-center justify-between px-5 pt-5 pb-3 border-b border-doggram-border shrink-0">
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-10 h-1 rounded-full bg-doggram-border" />
            <h3 className="text-base font-bold text-doggram-brown-dark">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-doggram-brown-soft hover:text-doggram-brown-dark transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-doggram-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <SkeletonCircle size={48} />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
              ))
            ) : profiles.length === 0 ? (
              <div className="text-center py-16 px-6">
                <p className="text-4xl mb-3">🐾</p>
                <p className="text-sm text-doggram-brown-soft font-medium">
                  {type === "followers" ? "Nenhum seguidor ainda" : "Não segue ninguém ainda"}
                </p>
              </div>
            ) : (
              profiles.map((p) => (
                <FollowRow key={p.id} profile={p} onClose={onClose} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
