import { NextRequest, NextResponse } from "next/server";
import { fetchRepoReadmePreview } from "@/lib/github";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/readme?repo=repoName
 * Returns README preview (first image + summary) for a repo
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoName = searchParams.get("repo");

  if (!repoName) {
    return NextResponse.json({ error: "Missing repo parameter" }, { status: 400 });
  }

  try {
    const preview = await fetchRepoReadmePreview(repoName);
    return NextResponse.json(
      { repoName, preview },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch README preview:", error);
    return NextResponse.json(
      { repoName, preview: null },
      { status: 500 }
    );
  }
}
