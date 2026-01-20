"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import siteData from "@/data/site.json";

export function Research() {
  if (!siteData.research || siteData.research.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold mb-6">Research</h2>

      <div className="space-y-6">
        {siteData.research.map((paper, index) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <Link
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 -mx-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-accent">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-accent transition-colors">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {paper.publication}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {paper.description}
                  </p>
                  <p className="text-xs text-accent mt-2 flex items-center gap-1">
                    DOI: {paper.doi}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </p>
                </div>
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
