import { describe, it, expect } from "vitest";
import { sanitizeReadmeHtml } from "../lib/markdown";

describe("sanitizeReadmeHtml", () => {
  it("strips script tags and javascript: URLs from HTML", () => {
    const maliciousHtml = `
      <h1>Project Title</h1>
      <p>Normal content</p>
      <script>alert('XSS')</script>
      <a href="javascript:alert('XSS')">Click me</a>
      <img src="javascript:alert('XSS')" alt="bad">
      <div onclick="alert('XSS')">Clickable div</div>
      <a href="https://example.com">Safe link</a>
      <img src="https://example.com/image.png" alt="Safe image">
    `;

    const sanitized = sanitizeReadmeHtml(maliciousHtml);

    // Should NOT contain malicious content
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("</script>");
    expect(sanitized).not.toContain("javascript:");
    expect(sanitized).not.toContain("onclick");
    expect(sanitized).not.toContain("alert(");

    // Should STILL contain safe content
    expect(sanitized).toContain("<h1>Project Title</h1>");
    expect(sanitized).toContain("<p>Normal content</p>");
    expect(sanitized).toContain('href="https://example.com"');
    expect(sanitized).toContain('src="https://example.com/image.png"');

    // External links should have safe attributes
    expect(sanitized).toContain('rel="noopener noreferrer"');
    expect(sanitized).toContain('target="_blank"');
  });
});
