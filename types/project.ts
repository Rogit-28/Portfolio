// TypeScript interfaces for GitHub projects

export interface ParsedReadme {
  raw: string;
  html: string;
  firstImage: string | null;
  summary: string;
  sections: ReadmeSection[];
  links: string[];
}

export interface ReadmeSection {
  heading: string;
  content: string;
  level: number;
}

export interface Project {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  externalUrl: string | null;

  // Metadata
  language: string | null;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;

  // Dates
  createdAt: string;
  updatedAt: string;

  // Status
  isPinned: boolean;
  isArchived: boolean;
  isFork: boolean;

  // README content
  readme: ParsedReadme | null;
}

// GitHub API response types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
}

export interface GitHubReadmeResponse {
  content: string;
  encoding: string;
}

export interface GitHubGraphQLResponse {
  data: {
    user: {
      pinnedItems: {
        nodes: Array<{
          name: string;
        }>;
      };
    };
  };
}
