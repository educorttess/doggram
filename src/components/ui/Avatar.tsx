import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  storyRing?: boolean;
  gradientBorder?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, { px: number; textSize: string }> = {
  xs:    { px: 28,  textSize: "text-base" },
  sm:    { px: 36,  textSize: "text-lg"   },
  md:    { px: 48,  textSize: "text-2xl"  },
  lg:    { px: 64,  textSize: "text-3xl"  },
  xl:    { px: 88,  textSize: "text-4xl"  },
  "2xl": { px: 120, textSize: "text-5xl"  },
};

export function Avatar({
  src,
  alt,
  size = "md",
  storyRing = false,
  gradientBorder = false,
  className = "",
}: AvatarProps) {
  const { px, textSize } = sizeMap[size];

  const inner = src ? (
    <Image
      src={src}
      alt={alt}
      width={px}
      height={px}
      className="rounded-full object-cover w-full h-full"
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full bg-doggram-surface border border-doggram-border w-full h-full ${textSize}`}
    >
      🐕
    </div>
  );

  /* ── Story ring (with gap) ── */
  if (storyRing) {
    return (
      <div
        className={`rounded-full bg-gradient-to-tr from-doggram-coral via-doggram-orange to-doggram-amber p-0.5 shrink-0 ${className}`}
        style={{ width: px + 4, height: px + 4 }}
      >
        <div className="rounded-full bg-doggram-cream p-0.5 w-full h-full">
          <div style={{ width: px - 4, height: px - 4 }}>{inner}</div>
        </div>
      </div>
    );
  }

  /* ── Gradient border (no gap — post card headers) ── */
  if (gradientBorder) {
    return (
      <div
        className={`rounded-full bg-gradient-to-tr from-doggram-coral via-doggram-orange to-doggram-amber p-[2px] shrink-0 ${className}`}
        style={{ width: px + 4, height: px + 4 }}
      >
        <div className="rounded-full overflow-hidden w-full h-full">
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 ${className}`}
      style={{ width: px, height: px }}
    >
      {inner}
    </div>
  );
}
