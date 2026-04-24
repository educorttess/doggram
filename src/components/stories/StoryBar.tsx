"use client";

import { useEffect, useRef, useState } from "react";
import { StoryRing } from "./StoryRing";
import { StoryViewer, type StoryGroup } from "./StoryViewer";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/utils/image";
import { SUPABASE_STORAGE_BUCKET_STORIES } from "@/constants/config";
import type { Profile } from "@/types/profile";

interface StoryBarProps {
  currentProfile: Profile | null;
}

export function StoryBar({ currentProfile }: StoryBarProps) {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [ownGroup, setOwnGroup] = useState<StoryGroup | null>(null);
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchStories(profile: Profile) {
    const supabase = createClient();

    // Fetch stories from other dogs
    const { data } = await supabase
      .from("stories")
      .select("id, image_url, created_at, profile_id, profiles!inner(id, username, dog_name, avatar_url)")
      .gt("expires_at", new Date().toISOString())
      .neq("profile_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      const groupMap = new Map<string, StoryGroup>();
      for (const item of data as unknown as {
        id: string; image_url: string; created_at: string;
        profiles: { id: string; username: string; dog_name: string; avatar_url: string | null };
      }[]) {
        const p = item.profiles;
        if (!groupMap.has(p.id)) {
          groupMap.set(p.id, {
            profileId: p.id,
            username: p.username,
            dogName: p.dog_name,
            avatarUrl: p.avatar_url,
            stories: [],
          });
        }
        groupMap.get(p.id)!.stories.push({ id: item.id, image_url: item.image_url, created_at: item.created_at });
      }
      setGroups(Array.from(groupMap.values()));
    }

    // Fetch own active stories
    const { data: own } = await supabase
      .from("stories")
      .select("id, image_url, created_at")
      .eq("profile_id", profile.id)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (own && own.length > 0) {
      setOwnGroup({
        profileId: profile.id,
        username: profile.username,
        dogName: profile.dog_name,
        avatarUrl: profile.avatar_url,
        stories: own as { id: string; image_url: string; created_at: string }[],
      });
    } else {
      setOwnGroup(null);
    }
  }

  useEffect(() => {
    if (currentProfile) fetchStories(currentProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile?.id]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentProfile) return;
    e.target.value = "";
    setUploading(true);

    try {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `${currentProfile.id}/${Date.now()}.webp`;

      const { error: uploadErr } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET_STORIES)
        .upload(path, compressed, { contentType: "image/webp" });

      if (uploadErr) { console.error(uploadErr); return; }

      const { data: urlData } = supabase.storage.from(SUPABASE_STORAGE_BUCKET_STORIES).getPublicUrl(path);

      await supabase.from("stories").insert({
        profile_id: currentProfile.id,
        image_url: urlData.publicUrl,
      });

      await fetchStories(currentProfile);
    } finally {
      setUploading(false);
    }
  }

  function handleOwnClick() {
    if (ownGroup) {
      setViewingIdx(0);
    } else {
      fileInputRef.current?.click();
    }
  }

  // Viewer groups: own first (if exists), then others
  const allGroups = ownGroup ? [ownGroup, ...groups] : groups;

  return (
    <>
      <div className="bg-doggram-warm-white border-b border-doggram-border">
        <div className="flex gap-3 px-3 py-3 overflow-x-auto no-scrollbar">
          {currentProfile && (
            <StoryRing
              username={currentProfile.username}
              dogName={currentProfile.dog_name}
              avatarUrl={currentProfile.avatar_url}
              hasStory={!!ownGroup}
              isOwn
              loading={uploading}
              onClick={handleOwnClick}
            />
          )}

          {groups.map((g, i) => (
            <StoryRing
              key={g.profileId}
              username={g.username}
              dogName={g.dogName}
              avatarUrl={g.avatarUrl}
              hasStory
              onClick={() => setViewingIdx(ownGroup ? i + 1 : i)}
            />
          ))}

          {groups.length === 0 && !currentProfile &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 w-16 shrink-0">
                <div className="w-[68px] h-[68px] rounded-full bg-doggram-border animate-pulse" />
                <div className="h-2.5 w-12 rounded-full bg-doggram-border animate-pulse" />
              </div>
            ))
          }
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {viewingIdx !== null && allGroups.length > 0 && (
        <StoryViewer
          groups={allGroups}
          initialGroupIndex={viewingIdx}
          onClose={() => setViewingIdx(null)}
        />
      )}
    </>
  );
}
