"use client";

import { StoryBar } from "@/components/stories/StoryBar";
import { FeedList } from "@/components/feed/FeedList";
import { DogOfDayBanner } from "@/components/engagement/DogOfDayBanner";
import { useCurrentProfile } from "@/lib/hooks/useCurrentProfile";

export default function FeedPage() {
  const { profile } = useCurrentProfile();

  return (
    <>
      <StoryBar currentProfile={profile} />
      <DogOfDayBanner />
      <FeedList currentProfile={profile} />
    </>
  );
}
