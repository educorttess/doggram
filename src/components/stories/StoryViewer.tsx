"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeDate } from "@/lib/utils/format";

export interface StoryItem {
  id: string;
  image_url: string;
  created_at: string;
}

export interface StoryGroup {
  profileId: string;
  username: string;
  dogName: string;
  avatarUrl: string | null;
  stories: StoryItem[];
}

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  onClose: () => void;
}

const DURATION_MS = 5000;

export function StoryViewer({ groups, initialGroupIndex, onClose }: StoryViewerProps) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIndex);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Refs for mutable state used inside the interval
  const posRef = useRef({ g: initialGroupIndex, s: 0 });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const isPausedRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // These refs always hold fresh navigation functions (updated every render)
  const goNextRef = useRef(() => {});
  const goPrevRef = useRef(() => {});

  goNextRef.current = () => {
    const { g, s } = posRef.current;
    const stories = groups[g]?.stories ?? [];
    if (s + 1 < stories.length) {
      posRef.current = { g, s: s + 1 };
      elapsedRef.current = 0;
      setStoryIdx(s + 1);
      setProgress(0);
    } else if (g + 1 < groups.length) {
      posRef.current = { g: g + 1, s: 0 };
      elapsedRef.current = 0;
      setGroupIdx(g + 1);
      setStoryIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  goPrevRef.current = () => {
    const { g, s } = posRef.current;
    if (s > 0) {
      posRef.current = { g, s: s - 1 };
      elapsedRef.current = 0;
      setStoryIdx(s - 1);
      setProgress(0);
    } else if (g > 0) {
      posRef.current = { g: g - 1, s: 0 };
      elapsedRef.current = 0;
      setGroupIdx(g - 1);
      setStoryIdx(0);
      setProgress(0);
    }
  };

  // Restart timer when story changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    elapsedRef.current = 0;
    isPausedRef.current = false;
    startRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      const total = elapsedRef.current + (Date.now() - startRef.current);
      const pct = Math.min((total / DURATION_MS) * 100, 100);
      setProgress(pct);
      if (pct >= 100) goNextRef.current();
    }, 50);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [groupIdx, storyIdx]);

  // ESC key to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function handlePointerDown() {
    holdTimerRef.current = setTimeout(() => {
      isPausedRef.current = true;
      elapsedRef.current += Date.now() - startRef.current;
      holdTimerRef.current = null;
    }, 150);
  }

  function handlePointerUp(side: "left" | "right") {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
      if (side === "left") goPrevRef.current();
      else goNextRef.current();
    } else if (isPausedRef.current) {
      isPausedRef.current = false;
      startRef.current = Date.now();
    }
  }

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];
  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-sm mx-auto overflow-hidden">
        {/* Story image */}
        <Image
          src={story.image_url}
          alt={group.dogName}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />

        {/* Top gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none" />

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none" />

        {/* Progress bars */}
        <div className="absolute top-0 inset-x-0 z-20 flex gap-1 px-2 pt-3 pointer-events-none">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < storyIdx ? "100%" : i === storyIdx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header: avatar + name + close */}
        <div className="absolute top-5 inset-x-0 z-20 flex items-center justify-between px-3 pt-2">
          <div className="flex items-center gap-2.5 pointer-events-none">
            <Avatar src={group.avatarUrl} alt={group.dogName} size="sm" />
            <div>
              <p className="text-sm font-bold text-white leading-tight">{group.dogName}</p>
              <p className="text-[11px] text-white/70">{formatRelativeDate(story.created_at)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/90 hover:text-white transition-colors z-30"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tap zones: left third = back, right two-thirds = forward */}
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerUp={() => handlePointerUp("left")}
          />
          <div
            className="flex-1 h-full cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerUp={() => handlePointerUp("right")}
          />
        </div>
      </div>
    </div>
  );
}
