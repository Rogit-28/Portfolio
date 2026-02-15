"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Project } from "@/types/project";
import { ProjectCard } from "./project-card";
import { ProjectModal } from "./project-modal";

interface ProjectGridProps {
  pinnedProjects: Project[];
  totalNonPinned: number;
}

interface ProjectsPageResult {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  rateLimited?: boolean;
}

export function ProjectGrid({
  pinnedProjects,
  totalNonPinned,
}: ProjectGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
  const currentPage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  const safePage = Math.min(currentPage, Math.max(1, Math.ceil(totalNonPinned / 10)));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<ProjectsPageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pinnedIds = useMemo(
    () => new Set(pinnedProjects.map((project) => project.id)),
    [pinnedProjects]
  );
  useEffect(() => {
    if (!Number.isFinite(safePage) || safePage < 1) return;

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();

    fetch(`/api/projects?page=${safePage}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        return response.json();
      })
      .then((data: ProjectsPageResult) => {
        if (data.rateLimited) {
          setError("Rate limited. Please try again later.");
          setProjects([]);
          return;
        }

        const filteredProjects = data.projects.filter(
          (project) => !pinnedIds.has(project.id)
        );

        setProjects(filteredProjects);
        setPagination(data);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Failed to load projects");
        console.error("Error fetching projects:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [safePage, pinnedIds]);


  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalNonPinned / 10));
  const hasPrev = pagination?.hasPrev ?? safePage > 1;
  const hasNext = pagination?.hasNext ?? safePage < totalPages;
  const totalCount = pinnedProjects.length + projects.length;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    const queryString = params.toString();
    router.push(queryString ? `/projects?${queryString}` : "/projects");
  };

  return (
    <>
      <div className="space-y-12">
        {/* Pinned/Featured Section */}
        {pinnedProjects.length > 0 && safePage === 1 && (
          <section aria-labelledby="pinned-heading">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
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
        {(projects.length > 0 || isLoading) && (
          <section aria-labelledby="all-projects-heading">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              className="mb-6"
            >
              <h2 id="all-projects-heading" className="text-xl font-semibold">
                {pinnedProjects.length > 0 ? "All Projects" : "Projects"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCount} repositories loaded
              </p>
            </motion.div>

            <div className="relative">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
                {projects.map((project, index) => (
                  <li key={project.id}>
                    <ProjectCard
                      project={project}
                      index={index}
                      onExpand={setSelectedProject}
                    />
                  </li>
                ))}
              </ul>

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm">
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
                    <span>Loading projects...</span>
                  </div>
                </div>
              )}
            </div>

            {(pagination || totalNonPinned > 0) && (
              <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={!hasPrev || isLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Prev
                </button>

                <span className="text-muted-foreground">
                  Page {safePage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={!hasNext || isLoading}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="text-sm text-red-500" role="alert">{error}</div>
        )}

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
