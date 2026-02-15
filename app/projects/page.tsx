import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ProjectGrid } from "@/components/sections/project-grid";
import { getInitialProjects } from "@/lib/github";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open source projects and repositories by Rogit S",
};

// Revalidate every 6 hours
export const revalidate = 21600;

export default async function ProjectsPage() {
  const { pinned, totalNonPinned } = await getInitialProjects();

  return (
    <Container className="pt-16 md:pt-24 pb-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-1">Projects</h1>
        <p className="text-muted-foreground">
          A collection of my open source projects and experiments.
        </p>
      </div>

      <ProjectGrid
        pinnedProjects={pinned}
        totalNonPinned={totalNonPinned}
      />
    </Container>
  );
}
