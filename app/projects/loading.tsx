import { Container } from "@/components/layout/container";

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="h-40 bg-muted" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-muted rounded w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded-full w-16" />
          <div className="h-6 bg-muted rounded-full w-20" />
          <div className="h-6 bg-muted rounded-full w-14" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-muted rounded w-20" />
          <div className="h-8 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <Container className="py-12">
      <div className="mb-8">
        <div className="h-9 bg-muted rounded w-40 mb-2 animate-pulse" />
        <div className="h-5 bg-muted rounded w-80 animate-pulse" />
      </div>

      {/* Pinned section skeleton */}
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>

        {/* All projects section skeleton */}
        <section>
          <div className="mb-6">
            <div className="h-6 bg-muted rounded w-32 mb-1 animate-pulse" />
            <div className="h-4 bg-muted rounded w-40 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </section>
      </div>
    </Container>
  );
}
