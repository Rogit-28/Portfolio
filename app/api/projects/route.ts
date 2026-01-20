import { NextRequest, NextResponse } from "next/server";
import { getProjectsBatch, PROJECTS_BATCH_SIZE } from "@/lib/github";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects?offset=6
 * Returns next batch of non-pinned projects for infinite scroll
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const offsetParam = searchParams.get("offset");

  // Parse and validate offset
  const offset = offsetParam ? parseInt(offsetParam, 10) : PROJECTS_BATCH_SIZE;
  if (isNaN(offset) || offset < 0) {
    return NextResponse.json(
      { error: "Invalid offset parameter" },
      { status: 400 }
    );
  }

  try {
    const result = await getProjectsBatch(offset);

    return NextResponse.json(result, {
      headers: {
        // Cache for 1 hour on CDN, allow stale for 6 hours
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600",
      },
    });
  } catch (error) {
    console.error("Failed to fetch projects batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", projects: [], hasMore: false },
      { status: 500 }
    );
  }
}
