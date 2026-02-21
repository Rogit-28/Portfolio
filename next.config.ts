import type { NextConfig } from "next";

// Content Security Policy
// Note: 'unsafe-inline' is needed for Next.js styled-jsx and Framer Motion
// In production, consider using nonces for stricter CSP
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.github.com https://raw.githubusercontent.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Preconnect to GitHub API domains for faster load times
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: "<https://api.github.com>; rel=preconnect, <https://raw.githubusercontent.com>; rel=preconnect, <https://github.com>; rel=preconnect",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
