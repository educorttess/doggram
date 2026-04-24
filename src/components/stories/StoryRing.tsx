import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface StoryRingProps {
  username: string;
  dogName: string;
  avatarUrl: string | null;
  hasStory?: boolean;
  isOwn?: boolean;
  href?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function StoryRing({
  username,
  dogName,
  avatarUrl,
  hasStory = true,
  isOwn = false,
  href,
  onClick,
  loading = false,
}: StoryRingProps) {
  const inner = (
    <div className="flex flex-col items-center gap-1.5 w-16">
      <div className="relative">
        <Avatar src={avatarUrl} alt={dogName} size="lg" storyRing={hasStory} />
        {isOwn && !loading && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-doggram-orange to-doggram-amber border-2 border-doggram-cream flex items-center justify-center">
            <span className="text-white font-black leading-none" style={{ fontSize: 11 }}>+</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <Loader2 size={20} className="text-white animate-spin" />
          </div>
        )}
      </div>
      <span className="text-[11px] font-semibold text-doggram-brown-mid text-center leading-tight w-full truncate">
        {isOwn ? "Seu story" : dogName}
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} disabled={loading} className="shrink-0">
        {inner}
      </button>
    );
  }

  return (
    <Link href={href ?? `/${username}`} className="shrink-0">
      {inner}
    </Link>
  );
}
