"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import siteData from "@/data/site.json";

const terminals = [
  { text: "Loading page...", delay: 0 },
  { text: "Error: Page not found (404)", delay: 0.2 },
  { text: "Searching database...", delay: 0.4 },
  { text: "No matching records found.", delay: 0.6 },
  { text: "Hint: Try checking the URL path", delay: 0.8 },
  { text: ">", delay: 1, isPrompt: true },
];

export function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl glass-strong rounded-lg overflow-hidden"
      >
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-2 text-xs text-muted-foreground font-mono">
              guest@portfolio:~
            </span>
          </div>
        </div>

        <div className="p-8 font-mono text-sm space-y-3">
          {terminals.map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: line.delay }}
              className={
                line.isPrompt
                  ? "flex items-center gap-2"
                  : line.text.startsWith("Error:")
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
            >
              {line.isPrompt && <span className="text-emerald-500 dark:text-emerald-400">$</span>}
              {line.text}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className="mt-8 pt-6 border-t border-border"
          >
            <p className="text-muted-foreground mb-4">
              Would you like to return to safety?
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
              >
                <Icon name="home" className="w-4 h-4" />
                Return Home
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 transition-colors"
              >
                <Icon name="arrow-right" className="w-4 h-4" />
                View Projects
              </Link>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.4 }}
            className="text-xs text-muted-foreground mt-6"
          >
            If you believe this is an error, please{" "}
            <a
              href={`mailto:${siteData.email}`}
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              contact me
            </a>
            .
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
