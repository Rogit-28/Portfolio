import {
  GitHubRepo,
  GitHubReadmeResponse,
  GitHubGraphQLResponse,
  Project,
} from "@/types/project";
import { parseReadme } from "./markdown";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Rogit-28";
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Batch size for infinite scroll
export const PROJECTS_BATCH_SIZE = 6;

// Rate limit tracking
let rateLimitRemaining: number | null = null;
let rateLimitReset: number | null = null;

/**
 * Check if we're rate limited
 */
function isRateLimited(): boolean {
  if (rateLimitRemaining === null) return false;
  if (rateLimitRemaining > 0) return false;
  if (rateLimitReset && Date.now() / 1000 > rateLimitReset) {
    // Reset has passed, clear the tracking
    rateLimitRemaining = null;
    rateLimitReset = null;
    return false;
  }
  return true;
}

/**
 * Update rate limit info from response headers
 */
function updateRateLimitFromResponse(response: Response): void {
  const remaining = response.headers.get("X-RateLimit-Remaining");
  const reset = response.headers.get("X-RateLimit-Reset");
  if (remaining !== null) {
    rateLimitRemaining = parseInt(remaining, 10);
  }
  if (reset !== null) {
    rateLimitReset = parseInt(reset, 10);
  }
}

// Common headers for GitHub API
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-website",
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

// GraphQL headers
function getGraphQLHeaders(): HeadersInit {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is required for GraphQL API");
  }

  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "portfolio-website",
  };
}

/**
 * Fetch pinned repositories using GraphQL API
 */
export async function fetchPinnedRepos(): Promise<string[]> {
  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN not set, skipping pinned repos fetch");
    return [];
  }

  if (isRateLimited()) {
    console.warn("Rate limited, skipping pinned repos fetch");
    return [];
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: getGraphQLHeaders(),
      body: JSON.stringify({
        query,
        variables: { username: GITHUB_USERNAME },
      }),
    });

    updateRateLimitFromResponse(response);

    if (!response.ok) {
      console.error("GraphQL API error:", response.status);
      return [];
    }

    const data: GitHubGraphQLResponse = await response.json();
    return data.data.user.pinnedItems.nodes.map((node) => node.name);
  } catch (error) {
    console.error("Failed to fetch pinned repos:", error);
    return [];
  }
}

/**
 * Fetch all public repositories (lightweight, no README/languages)
 */
export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  if (isRateLimited()) {
    console.warn("Rate limited, returning empty repos list");
    return [];
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&direction=desc&type=public`,
      { headers: getHeaders() }
    );

    updateRateLimitFromResponse(response);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Filter out repos with "(Building)" in name and the profile config repo
    return repos.filter(
      (repo) =>
        !repo.name.includes("(Building)") &&
        repo.name !== GITHUB_USERNAME // Exclude profile README repo
    );
  } catch (error) {
    console.error("Failed to fetch repos:", error);
    return [];
  }
}

/**
 * Fetch README content for a repository
 */
export async function fetchRepoReadme(
  repoName: string
): Promise<string | null> {
  if (isRateLimited()) {
    return null;
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/readme`,
      { headers: getHeaders() }
    );

    updateRateLimitFromResponse(response);

    if (!response.ok) {
      return null;
    }

    const data: GitHubReadmeResponse = await response.json();

    // README content is base64 encoded
    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    return data.content;
  } catch (error) {
    console.error(`Failed to fetch README for ${repoName}:`, error);
    return null;
  }
}

/**
 * Fetch language breakdown for a repository
 */
export async function fetchRepoLanguages(
  repoName: string
): Promise<Record<string, number>> {
  if (isRateLimited()) {
    return {};
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/languages`,
      { headers: getHeaders() }
    );

    updateRateLimitFromResponse(response);

    if (!response.ok) {
      return {};
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch languages for ${repoName}:`, error);
    return {};
  }
}

/**
 * Extract URL from description text
 */
export function extractUrlFromDescription(
  description: string | null
): string | null {
  if (!description) return null;

  // Match URLs in description
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const matches = description.match(urlRegex);

  // Return first match that's not a GitHub URL
  const externalUrl = matches?.find(
    (url) => !url.includes("github.com") && !url.includes("githubusercontent.com")
  );

  return externalUrl || null;
}

/**
 * Convert repo name to display name
 * e.g., "Network-Performance-Monitor" -> "Network Performance Monitor"
 */
export function formatDisplayName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert a GitHub repo to a Project (with optional full data)
 */
export async function repoToProject(
  repo: GitHubRepo,
  isPinned: boolean,
  fetchFullData: boolean = false
): Promise<Project> {
  let parsedReadme = null;
  let languages: Record<string, number> = {};

  if (fetchFullData) {
    const [readmeContent, langData] = await Promise.all([
      fetchRepoReadme(repo.name),
      fetchRepoLanguages(repo.name),
    ]);
    parsedReadme = readmeContent ? parseReadme(readmeContent) : null;
    languages = langData;
  }

  const externalUrl = extractUrlFromDescription(repo.description);

  return {
    id: repo.id,
    name: repo.name,
    displayName: formatDisplayName(repo.name),
    description: repo.description,
    url: repo.html_url,
    homepage: repo.homepage || null,
    externalUrl,

    language: repo.language,
    languages,
    topics: repo.topics || [],
    stars: repo.stargazers_count,
    forks: repo.forks_count,

    createdAt: repo.created_at,
    updatedAt: repo.pushed_at,

    isPinned,
    isArchived: repo.archived,
    isFork: repo.fork,

    readme: parsedReadme,
  };
}

/**
 * Response type for initial projects load
 */
export interface ProjectsResponse {
  pinned: Project[];
  initial: Project[];
  totalRemaining: number;
  rateLimited: boolean;
}

/**
 * Get initial projects: pinned (with full data) + first batch of non-pinned (with full data)
 */
export async function getInitialProjects(): Promise<ProjectsResponse> {
  // Fetch pinned repos and all repos in parallel
  const [pinnedRepoNames, repos] = await Promise.all([
    fetchPinnedRepos(),
    fetchAllRepos(),
  ]);

  const pinnedSet = new Set(pinnedRepoNames);

  // Separate pinned and non-pinned repos
  const pinnedRepos = repos.filter((r) => pinnedSet.has(r.name));
  const nonPinnedRepos = repos.filter((r) => !pinnedSet.has(r.name));

  // Fetch full data for pinned repos
  const pinnedProjects = await Promise.all(
    pinnedRepos.map((repo) => repoToProject(repo, true, true))
  );

  // Fetch full data for first batch of non-pinned repos
  const initialBatch = nonPinnedRepos.slice(0, PROJECTS_BATCH_SIZE);
  const initialProjects = await Promise.all(
    initialBatch.map((repo) => repoToProject(repo, false, true))
  );

  return {
    pinned: pinnedProjects,
    initial: initialProjects,
    totalRemaining: Math.max(0, nonPinnedRepos.length - PROJECTS_BATCH_SIZE),
    rateLimited: isRateLimited(),
  };
}

/**
 * Get a batch of projects for infinite scroll (server-side, called by API route)
 */
export async function getProjectsBatch(
  offset: number
): Promise<{ projects: Project[]; hasMore: boolean; rateLimited: boolean }> {
  if (isRateLimited()) {
    return { projects: [], hasMore: false, rateLimited: true };
  }

  // Fetch all repos and pinned names
  const [pinnedRepoNames, repos] = await Promise.all([
    fetchPinnedRepos(),
    fetchAllRepos(),
  ]);

  const pinnedSet = new Set(pinnedRepoNames);

  // Get non-pinned repos sorted by pushed_at (already sorted from API)
  const nonPinnedRepos = repos.filter((r) => !pinnedSet.has(r.name));

  // Get the batch
  const batch = nonPinnedRepos.slice(offset, offset + PROJECTS_BATCH_SIZE);
  const hasMore = offset + PROJECTS_BATCH_SIZE < nonPinnedRepos.length;

  // Fetch full data for this batch
  const projects = await Promise.all(
    batch.map((repo) => repoToProject(repo, false, true))
  );

  return {
    projects,
    hasMore,
    rateLimited: isRateLimited(),
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getInitialProjects() instead
 */
export async function getProjects(): Promise<Project[]> {
  const { pinned, initial } = await getInitialProjects();
  return [...pinned, ...initial];
}
