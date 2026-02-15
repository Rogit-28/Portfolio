"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { formatDateRange } from "@/lib/utils";

// ============================================
// ScrollTimeline - wraps entries with a scroll-progress line
// ============================================

interface ScrollTimelineProps {
  children: React.ReactNode;
}

export function ScrollTimeline({ children }: ScrollTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 60%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001,
  });

  const scaleY = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative">
      {/* Background track line */}
      <div className="absolute left-0 top-2 bottom-0 w-px bg-border" />

      {/* Scroll-progress fill line */}
      <motion.div
        className="absolute left-0 top-2 bottom-0 w-px bg-accent origin-top"
        style={{ scaleY }}
      />

      {children}
    </div>
  );
}

// ============================================
// useEntryActive - detect when a timeline entry is "reached"
// ============================================

function useEntryActive(threshold = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Activate when the entry crosses the threshold going down
        if (entry.isIntersecting) {
          setIsActive(true);
        }
      },
      {
        threshold,
        rootMargin: "-20% 0px -40% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isActive };
}

// ============================================
// TimelineEntry - work experience
// ============================================

interface TimelineEntryProps {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current?: boolean;
  location: string;
  achievements: string[];
  index: number;
}

export function TimelineEntry({
  company,
  role,
  startDate,
  endDate,
  current,
  location,
  achievements,
  index,
}: TimelineEntryProps) {
  const { ref, isActive } = useEntryActive();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      {/* Timeline dot - reactive */}
      <div
        className={`absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full transition-all duration-500 ${
          isActive
            ? "bg-accent timeline-dot-active"
            : "bg-muted-foreground/30"
        }`}
      />

      {/* Ripple ring - appears on activation */}
      {isActive && (
        <div className="absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full timeline-dot-ripple" />
      )}

      {/* Content */}
      <div
        className={`space-y-2 rounded-lg px-4 py-3 -ml-1 transition-all duration-500 ${
          isActive
            ? "bg-accent/5 border-l-2 border-accent/20"
            : "border-l-2 border-transparent"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className={`font-semibold text-lg transition-colors duration-500 ${
            isActive ? "text-foreground" : "text-muted-foreground"
          }`}>{company}</h3>
          <span className="text-sm text-muted-foreground">
            {formatDateRange(startDate, endDate, current)}
          </span>
        </div>

        <p className="text-muted-foreground">{role}</p>

        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {location}
        </p>

        {achievements.length > 0 && (
          <ul className="mt-3 space-y-2">
            {achievements.map((achievement, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground flex gap-2"
              >
                <span className="text-accent flex-shrink-0 leading-[1.6]">•</span>
                <span className="leading-[1.6]">{achievement}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// EducationEntry
// ============================================

interface EducationEntryProps {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  grade?: string;
  index: number;
}

export function EducationEntry({
  institution,
  degree,
  field,
  startDate,
  endDate,
  current,
  grade,
  index,
}: EducationEntryProps) {
  const { ref, isActive } = useEntryActive();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 pb-4 last:pb-0"
    >
      {/* Timeline dot - reactive */}
      <div
        className={`absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full transition-all duration-500 ${
          isActive
            ? "bg-accent timeline-dot-active"
            : "bg-muted-foreground/30"
        }`}
      />

      {/* Ripple ring - appears on activation */}
      {isActive && (
        <div className="absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full timeline-dot-ripple" />
      )}

      {/* Content */}
      <div
        className={`space-y-1 rounded-lg px-4 py-3 -ml-1 transition-all duration-500 ${
          isActive
            ? "bg-accent/5 border-l-2 border-accent/20"
            : "border-l-2 border-transparent"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className={`font-semibold transition-colors duration-500 ${
            isActive ? "text-foreground" : "text-muted-foreground"
          }`}>{institution}</h3>
          <span className="text-sm text-muted-foreground">
            {startDate} - {current ? "Present" : endDate}
          </span>
        </div>

        <p className="text-muted-foreground">
          {degree} in {field}
        </p>

        {grade && (
          <p className="text-sm text-accent font-medium">{grade}</p>
        )}
      </div>
    </motion.div>
  );
}
