import { NextRequest, NextResponse } from "next/server";
import { getProjectsPage } from "@/lib/github";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects?page=1
 * Returns a page of non-pinned projects
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pageParam = searchParams.get("page");

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: "Invalid page parameter" },
      { status: 400 }
    );
  }

  try {
    const result = await getProjectsPage(page);

    return NextResponse.json(result, {
      headers: {
        // Cache for 1 hour on CDN, allow stale for 6 hours
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects page:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        projects: [],
        currentPage: page,
        totalPages: 0,
        totalProjects: 0,
        hasNext: false,
        hasPrev: false,
      },
      { status: 500 }
    );
  }
}
