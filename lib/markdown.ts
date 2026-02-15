import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { ParsedReadme, ReadmeSection } from "@/types/project";

// Sanitization config for README HTML
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "em", "b", "i", "u", "s", "del",
    "a", "code", "pre", "blockquote",
    "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "loading", "width", "height"],
    code: ["class"],
    pre: ["class"],
    div: ["class"],
    span: ["class"],
    th: ["align"],
    td: ["align"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["https", "http"],
    a: ["https", "http", "mailto"],
  },
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || "";
      // External links get safe attributes
      if (href.startsWith("http://") || href.startsWith("https://")) {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      }
      return { tagName, attribs };
    },
  },
  disallowedTagsMode: "discard",
};

// Configure marked for GitHub-flavored markdown
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Extract the first image URL from markdown content
 */
function extractFirstImage(markdown: string): string | null {
  // Match markdown images: ![alt](url)
  const mdImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
  const mdMatch = markdown.match(mdImageRegex);
  if (mdMatch) {
    return mdMatch[2];
  }

  // Match HTML images: <img src="url">
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const htmlMatch = markdown.match(htmlImageRegex);
  if (htmlMatch) {
    return htmlMatch[1];
  }

  return null;
}

/**
 * Extract a summary from the markdown (first meaningful paragraph)
 */
function extractSummary(markdown: string): string {
  // Remove badges (common at top of READMEs)
  const withoutBadges = markdown.replace(
    /\[!\[([^\]]*)\]\([^)]+\)\]\([^)]+\)/g,
    ""
  );

  // Split into lines and find first non-empty, non-heading, non-image line
  const lines = withoutBadges.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Skip headings
    if (trimmed.startsWith("#")) continue;

    // Skip images
    if (trimmed.startsWith("![")) continue;

    // Skip HTML tags
    if (trimmed.startsWith("<")) continue;

    // Skip badges/shields.io links
    if (trimmed.includes("shields.io") || trimmed.includes("badge")) continue;

    // Skip horizontal rules
    if (/^[-*_]{3,}$/.test(trimmed)) continue;

    // Found a good summary line
    // Clean up any remaining markdown syntax
    const cleaned = trimmed
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove links, keep text
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1") // Remove bold/italic
      .replace(/`([^`]+)`/g, "$1") // Remove inline code
      .trim();

    if (cleaned.length > 20) {
      // Truncate if too long
      return cleaned.length > 300
        ? cleaned.substring(0, 297) + "..."
        : cleaned;
    }
  }

  return "";
}

/**
 * Extract sections from markdown (headers and their content)
 */
function extractSections(markdown: string): ReadmeSection[] {
  const sections: ReadmeSection[] = [];
  const lines = markdown.split("\n");

  let currentSection: ReadmeSection | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = contentLines.join("\n").trim();
        if (currentSection.content) {
          sections.push(currentSection);
        }
      }

      // Start new section
      currentSection = {
        level: headingMatch[1].length,
        heading: headingMatch[2].trim(),
        content: "",
      };
      contentLines = [];
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  // Don't forget the last section
  if (currentSection) {
    currentSection.content = contentLines.join("\n").trim();
    if (currentSection.content) {
      sections.push(currentSection);
    }
  }

  return sections;
}

/**
 * Extract all links from markdown
 */
function extractLinks(markdown: string): string[] {
  const links: string[] = [];

  // Match markdown links: [text](url)
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(markdown)) !== null) {
    const url = match[2];
    if (url.startsWith("http") && !links.includes(url)) {
      links.push(url);
    }
  }

  // Match raw URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  while ((match = urlRegex.exec(markdown)) !== null) {
    const url = match[0];
    if (!links.includes(url)) {
      links.push(url);
    }
  }

  return links;
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeReadmeHtml(html: string): string {
  return sanitizeHtml(html, sanitizeOptions);
}

/**
 * Parse markdown README into structured data
 */
export function parseReadme(markdown: string): ParsedReadme {
  // Parse markdown to HTML
  const rawHtml = marked.parse(markdown) as string;
  // Sanitize to prevent XSS
  const html = sanitizeReadmeHtml(rawHtml);

  return {
    raw: markdown,
    html,
    firstImage: extractFirstImage(markdown),
    summary: extractSummary(markdown),
    sections: extractSections(markdown),
    links: extractLinks(markdown),
  };
}

export function parseReadmePreview(markdown: string): { firstImage: string | null; summary: string } {
  return {
    firstImage: extractFirstImage(markdown),
    summary: extractSummary(markdown),
  };
}

/**
 * Render a single section's content to HTML (sanitized)
 */
export function renderSectionHtml(content: string): string {
  const rawHtml = marked.parse(content) as string;
  return sanitizeReadmeHtml(rawHtml);
}
