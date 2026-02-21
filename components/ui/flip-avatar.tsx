"use client";

import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On mobile, don't include the 3D avatar to save performance
  // Show a tooltip on hover to indicate the flip feature (desktop only)
  return (
    <div
      className={cn(
        "flip-card cursor-pointer relative",
        isFlipped && "flipped",
        !isMobile && "group",
        className
      )}
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={() => !isMobile && setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      aria-label={isMobile ? "View avatar" : "Flip avatar to see 3D version"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setIsFlipped(!isFlipped);
        }
      }}
    >
      {/* Tooltip - only visible on desktop hover */}
      {!isMobile && !isFlipped && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 text-xs bg-foreground text-background rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Hover to see 3D
        </div>
      )}
      
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

        {/* Back - 3D Avatar - only rendered on desktop */}
        {!isMobile && (
          <div className="flip-card-back absolute inset-0 rounded-full overflow-hidden backface-hidden rotate-y-180">
            <Avatar3D />
          </div>
        )}
      </div>
    </div>
  );
}
