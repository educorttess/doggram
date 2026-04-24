"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useFollow } from "@/lib/hooks/useFollow";
import { createClient } from "@/lib/supabase/client";
import { formatCount } from "@/lib/utils/format";

interface SuggestedProfile {
  id: string;
  username: string;
  dog_name: string;
  breed: string | null;
  avatar_url: string | null;
  followers_count: number;
  is_verified: boolean;
}

function SuggestedCard({ profile }: { profile: SuggestedProfile }) {
  const { following, initialized, toggle } = useFollow(profile.id);

  return (
    <div className="flex flex-col items-center gap-2.5 w-36 shrink-0 bg-doggram-cream border border-doggram-border rounded-2xl p-3">
      <Link href={`/${profile.username}`} className="flex flex-col items-center gap-1.5">
        <Avatar src={profile.avatar_url} alt={profile.dog_name} size="lg" />
        <div className="text-center w-full">
          <p className="text-[13px] font-bold text-doggram-brown-dark leading-tight truncate max-w-full">
            {profile.dog_name}
          </p>
          {profile.breed && (
            <Badge variant="breed" className="mt-0.5 text-[10px]">
              {profile.breed.split(" ")[0]}
            </Badge>
          )}
          <p className="text-[11px] text-doggram-brown-soft mt-1">
            {formatCount(profile.followers_count)} seguidores
          </p>
        </div>
      </Link>

      {initialized && (
        <Button
          size="sm"
          variant={following ? "secondary" : "primary"}
          className="w-full text-xs py-1"
          onClick={toggle}
        >
          {following ? "Seguindo" : "Seguir"}
        </Button>
      )}
    </div>
  );
}

interface SuggestedDogsProps {
  currentProfileId: string | null;
}

export function SuggestedDogs({ currentProfileId }: SuggestedDogsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProfileId) { setLoading(false); return; }

    async function fetch() {
      const supabase = createClient();

      // Get IDs already followed
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", currentProfileId!);

      const followedIds = ((follows ?? []) as { following_id: string }[])
        .map((f) => f.following_id);

      // Exclude self + already-followed
      const excludeIds = [currentProfileId!, ...followedIds];

      let q = supabase
        .from("profiles")
        .select("id, username, dog_name, breed, avatar_url, followers_count, is_verified")
        .order("followers_count", { ascending: false })
        .limit(8);

      if (excludeIds.length > 0) {
        q = q.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data } = await q;
      setSuggestions(((data ?? []) as SuggestedProfile[]).slice(0, 5));
      setLoading(false);
    }

    fetch();
  }, [currentProfileId]);

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="bg-doggram-warm-white border-b border-doggram-border py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-doggram-orange" />
          <p className="text-sm font-bold text-doggram-brown-dark">
            Dogs sugeridos para você
          </p>
        </div>
        <Link href="/explore" className="text-xs font-bold text-doggram-orange hover:underline">
          Ver todos
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-2.5 px-4 overflow-x-auto no-scrollbar pb-0.5">
        {suggestions.map((profile) => (
          <SuggestedCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
