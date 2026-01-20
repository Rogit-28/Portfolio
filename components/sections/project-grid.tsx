"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Project } from "@/types/project";
import { ProjectCard } from "./project-card";
import { ProjectModal } from "./project-modal";
import { PROJECTS_BATCH_SIZE } from "@/lib/github";

interface ProjectGridProps {
  pinnedProjects: Project[];
  initialProjects: Project[];
  totalRemaining: number;
}

export function ProjectGrid({
  pinnedProjects,
  initialProjects,
  totalRemaining,
}: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [hasMore, setHasMore] = useState(totalRemaining > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track current offset for pagination
  const offsetRef = useRef(PROJECTS_BATCH_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch next batch of projects
  const fetchMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects?offset=${offsetRef.current}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();

      if (data.rateLimited) {
        setError("Rate limited. Please try again later.");
        setHasMore(false);
        return;
      }

      setProjects((prev) => [...prev, ...data.projects]);
      setHasMore(data.hasMore);
      offsetRef.current += PROJECTS_BATCH_SIZE;
    } catch (err) {
      setError("Failed to load more projects");
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading) {
          fetchMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(loader);

    return () => {
      observer.unobserve(loader);
    };
  }, [fetchMore, hasMore, isLoading]);

  const totalCount = pinnedProjects.length + projects.length;

  return (
    <>
      <div className="space-y-12">
        {/* Pinned/Featured Section */}
        {pinnedProjects.length > 0 && (
          <section aria-labelledby="pinned-heading">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-6"
            >
              <svg
                className="w-5 h-5 text-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 id="pinned-heading" className="text-xl font-semibold">Pinned</h2>
            </motion.div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
              {pinnedProjects.map((project, index) => (
                <li key={project.id}>
                  <ProjectCard
                    project={project}
                    index={index}
                    onExpand={setSelectedProject}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All Projects Section */}
        {projects.length > 0 && (
          <section aria-labelledby="all-projects-heading">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <h2 id="all-projects-heading" className="text-xl font-semibold">
                {pinnedProjects.length > 0 ? "All Projects" : "Projects"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} repositories loaded
                {hasMore && " (scroll for more)"}
              </p>
            </motion.div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
              {projects.map((project, index) => (
                <li key={project.id}>
                  <ProjectCard
                    project={project}
                    index={index + pinnedProjects.length}
                    onExpand={setSelectedProject}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Loading indicator / Intersection observer target */}
        <div ref={loaderRef} className="py-8 flex justify-center" aria-live="polite">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground" role="status">
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading more projects...</span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500" role="alert">{error}</div>
          )}

          {!hasMore && projects.length > 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              All projects loaded
            </p>
          )}
        </div>

        {/* Empty state */}
        {pinnedProjects.length === 0 && projects.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No projects found</h3>
            <p className="text-muted-foreground">
              Check back later for updates.
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal for expanded project view */}
      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
