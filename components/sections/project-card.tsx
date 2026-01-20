"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@/types/project";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  index: number;
  onExpand?: (project: Project) => void;
}

// Language color mapping for visual distinction
const languageColors: Record<string, string> = {
  Python: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  TypeScript: "bg-blue-600",
  Rust: "bg-orange-600",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  "C++": "bg-pink-600",
  C: "bg-gray-600",
  "Jupyter Notebook": "bg-orange-500",
  HTML: "bg-orange-600",
  CSS: "bg-purple-500",
  Shell: "bg-green-500",
  default: "bg-gray-500",
};

export function ProjectCard({ project, index, onExpand }: ProjectCardProps) {
  const hasLiveDemo = project.homepage || project.externalUrl;
  const demoUrl = project.homepage || project.externalUrl;

  // Get language color
  const langColor = project.language
    ? languageColors[project.language] || languageColors.default
    : languageColors.default;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={cn(
          "project-card relative overflow-hidden rounded-2xl"
        )}
      >
        {/* Pinned badge */}
        {project.isPinned && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full glass-subtle text-accent border-accent/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>
        )}

        {/* Image/Preview area */}
        <div className="relative h-40 overflow-hidden bg-muted">
          {project.readme?.firstImage ? (
            <Image
              src={project.readme.firstImage}
              alt={project.displayName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized // External images
            />
          ) : (
            // Gradient placeholder with language indicator
            <div
              className={cn(
                "w-full h-full flex items-center justify-center",
                "bg-gradient-to-br from-muted to-muted/50"
              )}
            >
              <div className="text-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center",
                    langColor
                  )}
                >
                  <span className="text-white font-bold text-lg">
                    {project.language?.[0] || "?"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {project.language || "Unknown"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-accent transition-colors">
              {project.displayName}
            </h3>
            {project.stars > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {project.stars}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description || project.readme?.summary || "No description available"}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.language && (
              <Tag variant="accent">{project.language}</Tag>
            )}
            {project.topics.slice(0, 3).map((topic) => (
              <Tag key={topic}>{topic}</Tag>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-muted hover:bg-border transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              GitHub
            </Link>

            {hasLiveDemo && demoUrl && (
              <Link
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent-hover transition-colors"
              >
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Live Demo
              </Link>
            )}

            {project.readme && onExpand && (
              <button
                onClick={() => onExpand(project)}
                className="ml-auto inline-flex items-center gap-1 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View Details
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
