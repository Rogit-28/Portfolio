"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import Avatar3D to avoid SSR issues with Three.js
const Avatar3D = dynamic(
  () => import("./avatar-3d").then((mod) => mod.Avatar3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-accent/10 animate-pulse" />
    ),
  }
);

interface FlipAvatarProps {
  initials: string;
  className?: string;
}

export function FlipAvatar({ initials, className }: FlipAvatarProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("flip-card cursor-pointer", className)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      aria-label="Flip avatar to see 3D version"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setIsFlipped(!isFlipped);
        }
      }}
    >
      <div
        className={cn(
          "flip-card-inner w-40 h-40 md:w-48 md:h-48 transition-transform duration-700",
          isFlipped && "flip-card-flipped"
        )}
      >
        {/* Front - Initials */}
        <div className="flip-card-front absolute inset-0 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center backface-hidden">
          <span className="text-4xl md:text-5xl font-bold text-accent">
            {initials}
          </span>
        </div>

        {/* Back - 3D Avatar */}
        <div className="flip-card-back absolute inset-0 rounded-full overflow-hidden backface-hidden rotate-y-180">
          <Avatar3D />
        </div>
      </div>
    </div>
  );
}
