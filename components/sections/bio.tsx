"use client";

import { motion } from "framer-motion";
import siteData from "@/data/site.json";

// Keywords to highlight with accent color
const highlightKeywords = [
  "SRM University, Chennai",
  "data",
  "strategic move",
  "competitive edge",
  "Kalvium",
  "Acetech Group",
  "Profisolutions",
  "data pipelines",
  "ML models",
  "automation systems",
  "backend engineering",
  "data science",
  "AI/ML",
];

// Helper function to highlight keywords in text
function highlightText(text: string, keywords: string[]): React.ReactNode {
  // Sort keywords by length (longest first) to avoid partial matches
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  
  // Create regex pattern (case-insensitive)
  const pattern = new RegExp(
    `(${sortedKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );
  
  const parts = text.split(pattern);
  
  return parts.map((part, index) => {
    const isKeyword = sortedKeywords.some(
      (keyword) => keyword.toLowerCase() === part.toLowerCase()
    );
    
    if (isKeyword) {
      return (
        <span key={index} className="font-medium" style={{ color: 'var(--accent-soft)' }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export function Bio() {
  const paragraphs = siteData.bio.long.split("\n\n");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold mb-6">About</h2>
      <div className="prose max-w-none space-y-4">
        {/* Intro line */}
        <p className="text-muted-foreground leading-relaxed text-lg text-justify">
          {highlightText(
            "Hi, I'm Rogit - a final-year Computer Science student at SRM University, Chennai passionate about building robust systems and solving complex problems with data.",
            highlightKeywords
          )}
        </p>
        
        {/* Bio paragraphs */}
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="text-muted-foreground leading-relaxed text-lg text-justify"
          >
            {highlightText(paragraph, highlightKeywords)}
          </p>
        ))}
      </div>
    </motion.section>
  );
}
