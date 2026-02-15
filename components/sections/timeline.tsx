"use client";

import { motion } from "framer-motion";
import { formatDateRange } from "@/lib/utils";

// ============================================
// Timeline - wrapper with single continuous shimmer line
// ============================================

export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Single continuous timeline line with shimmer */}
      <div className="absolute left-0 top-2 bottom-0 w-px timeline-line-shimmer" />
      {children}
    </div>
  );
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
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative pl-8 pb-6 last:pb-0"
    >
      {/* Timeline dot - springs in */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: index * 0.15 + 0.2,
        }}
        className="absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full bg-accent"
      />

      {/* Content */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="font-semibold text-lg">{company}</h3>
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
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative pl-8 pb-4 last:pb-0"
    >
      {/* Timeline dot - springs in */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: index * 0.15 + 0.2,
        }}
        className="absolute left-0 top-2 w-2 h-2 -translate-x-1/2 rounded-full bg-accent"
      />

      {/* Content */}
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="font-semibold">{institution}</h3>
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
