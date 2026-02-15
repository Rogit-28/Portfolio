import {
  GitHubRepo,
  GitHubReadmeResponse,
  GitHubGraphQLResponse,
  Project,
  ReadmePreview,
} from "@/types/project";
import { parseReadme, parseReadmePreview } from "./markdown";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "Rogit-28";
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

// Batch size for pagination
export const PROJECTS_BATCH_SIZE = 10;

// Rate limit tracking
let rateLimitRemaining: number | null = null;
let rateLimitReset: number | null = null;

const README_CACHE_TTL_MS = 1000 * 60 * 60;
const readmePreviewCache = new Map<
  string,
  { value: ReadmePreview | null; expiresAt: number }
>();
const readmeFullCache = new Map<
  string,
  { value: ReturnType<typeof parseReadme> | null; expiresAt: number }
>();

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

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "portfolio-website",
};

// Common headers for GitHub API
function getHeaders(requireAuth = false): HeadersInit {
  if (!GITHUB_TOKEN) {
    if (requireAuth) {
      throw new Error("GITHUB_TOKEN is required for this request");
    }
    return DEFAULT_HEADERS;
  }

  return {
    ...DEFAULT_HEADERS,
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  };
}

/**
 * Fetch pinned repositories using GraphQL API
 */
export async function fetchPinnedRepos(): Promise<string[]> {
  if (!GITHUB_TOKEN || isRateLimited()) {
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

  if (!GITHUB_TOKEN) {
    return [];
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: "POST",
      headers: getHeaders(true),
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
    if (GITHUB_TOKEN) {
      console.error("Failed to fetch pinned repos:", error);
    }
    return [];
  }
}

/**
 * Fetch all public repositories (lightweight, no README/languages)
 */
export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  if (isRateLimited()) {
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

    return repos.filter(
      (repo) =>
        !repo.name.includes("(Building)") &&
        repo.name !== GITHUB_USERNAME
    );
  } catch (error) {
    if (GITHUB_TOKEN) {
      console.error("Failed to fetch repos:", error);
    }
    return [];
  }
}

/**
 * Fetch README content for a repository
 */
async function fetchRepoReadmeContent(repoName: string): Promise<string | null> {
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

function getCachedReadme<T>(
  cache: Map<string, { value: T | null; expiresAt: number }>,
  repoName: string
): { hit: boolean; value: T | null } {
  const cached = cache.get(repoName);
  if (!cached) return { hit: false, value: null };
  if (Date.now() > cached.expiresAt) {
    cache.delete(repoName);
    return { hit: false, value: null };
  }
  return { hit: true, value: cached.value };
}

function setCachedReadme<T>(
  cache: Map<string, { value: T | null; expiresAt: number }>,
  repoName: string,
  value: T | null
) {
  cache.set(repoName, { value, expiresAt: Date.now() + README_CACHE_TTL_MS });
}

export async function fetchRepoReadmePreview(
  repoName: string
): Promise<ReadmePreview | null> {
  const { hit, value } = getCachedReadme(readmePreviewCache, repoName);
  if (hit) return value;

  const content = await fetchRepoReadmeContent(repoName);
  if (!content) {
    setCachedReadme(readmePreviewCache, repoName, null);
    return null;
  }

  const preview = parseReadmePreview(content);
  setCachedReadme(readmePreviewCache, repoName, preview);
  return preview;
}

export async function fetchRepoReadmeFull(
  repoName: string
): Promise<ReturnType<typeof parseReadme> | null> {
  const { hit, value } = getCachedReadme(readmeFullCache, repoName);
  if (hit) return value;

  const content = await fetchRepoReadmeContent(repoName);
  if (!content) {
    setCachedReadme(readmeFullCache, repoName, null);
    return null;
  }

  const parsed = parseReadme(content);
  setCachedReadme(readmeFullCache, repoName, parsed);
  return parsed;
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
      fetchRepoReadmeFull(repo.name),
      fetchRepoLanguages(repo.name),
    ]);
    parsedReadme = readmeContent;
    languages = langData;
  }

  const preview = fetchFullData
    ? parsedReadme
      ? { firstImage: parsedReadme.firstImage, summary: parsedReadme.summary }
      : null
    : null;

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
    readmePreview: preview,
  };
}

/**
 * Response type for initial projects load
 */
export interface ProjectsResponse {
  pinned: Project[];
  totalNonPinned: number;
  rateLimited: boolean;
}

export interface ProjectsPageResponse {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  totalProjects: number;
  hasNext: boolean;
  hasPrev: boolean;
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

  return {
    pinned: pinnedProjects,
    totalNonPinned: nonPinnedRepos.length,
    rateLimited: isRateLimited(),
  };
}

/**
 * Get a paginated page of non-pinned projects
 */
export async function getProjectsPage(
  page: number
): Promise<ProjectsPageResponse> {
  if (isRateLimited()) {
    return {
      projects: [],
      currentPage: page,
      totalPages: 0,
      totalProjects: 0,
      hasNext: false,
      hasPrev: false,
      rateLimited: true,
    };
  }

  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  // Fetch all repos and pinned names
  const [pinnedRepoNames, repos] = await Promise.all([
    fetchPinnedRepos(),
    fetchAllRepos(),
  ]);

  const pinnedSet = new Set(pinnedRepoNames);

  // Get non-pinned repos sorted by pushed_at (already sorted from API)
  const nonPinnedRepos = repos.filter((r) => !pinnedSet.has(r.name));
  const totalProjects = nonPinnedRepos.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / PROJECTS_BATCH_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const safeOffset = (safePage - 1) * PROJECTS_BATCH_SIZE;

  if (totalProjects === 0) {
    return {
      projects: [],
      currentPage: 1,
      totalPages: 1,
      totalProjects: 0,
      hasNext: false,
      hasPrev: false,
      rateLimited: false,
    };
  }

  // Get the batch
  const batch = nonPinnedRepos.slice(safeOffset, safeOffset + PROJECTS_BATCH_SIZE);

  // Fetch lightweight data for this batch
  const projects = await Promise.all(
    batch.map((repo) => repoToProject(repo, false, false))
  );

  return {
    projects,
    currentPage: safePage,
    totalPages,
    totalProjects,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    rateLimited: isRateLimited(),
  };
}

