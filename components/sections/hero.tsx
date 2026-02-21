"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { FlipAvatar } from "@/components/ui/flip-avatar";
import { Icon } from "@/components/ui/icon";
import siteData from "@/data/site.json";

// Dynamically import particles (client-only)
const ParticlesBackground = dynamic(
  () =>
    import("@/components/ui/particles-background").then(
      (mod) => mod.ParticlesBackground
    ),
  { ssr: false }
);

export function Hero() {
  const [isWarping, setIsWarping] = useState(true);

  const initials = siteData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-8">
      {/* Particle background */}
      <ParticlesBackground onWarpComplete={() => setIsWarping(false)} />

      {/* Main content */}
      <AnimatePresence>
        {!isWarping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-6"
          >
            {/* Avatar - flips to 3D on hover/click */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            >
              <FlipAvatar initials={initials} />
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold tracking-tight shimmer-text"
            >
              {siteData.name.toUpperCase()}
            </motion.h1>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground"
            >
              {siteData.tagline ? (
                siteData.tagline.map((item, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.45 + idx * 0.1 }}
                  >
                    {item}
                    {idx < siteData.tagline!.length - 1 && " • "}
                  </motion.span>
                ))
              ) : (
                <span>Data Analytics • Business Intelligence • AI/ML</span>
              )}
            </motion.div>

            {/* Location */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-sm text-muted-foreground flex items-center gap-1.5"
            >
              <Icon name="location" className="w-4 h-4" />
              {siteData.location}
            </motion.p>

            {/* Interest Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {siteData.skills.interests.slice(0, 4).map((interest) => (
                <Tag key={interest} variant="accent">
                  {interest}
                </Tag>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-wrap justify-center gap-3 pt-4"
            >
              <Button href={`mailto:${siteData.email}`}>
                <Icon name="email" className="w-4 h-4" />
                Email
              </Button>
              <Button href={siteData.resume} variant="secondary" external>
                <Icon name="download" className="w-4 h-4" />
                Resume
              </Button>
              <Button href={siteData.social.linkedin} variant="secondary" external>
                <Icon name="linkedin" className="w-4 h-4" />
                LinkedIn
              </Button>
              <Button href={siteData.social.github} variant="secondary" external>
                <Icon name="github" className="w-4 h-4" />
                GitHub
              </Button>
              <Button href={siteData.blog.url} variant="secondary" external>
                <Icon name="blog" className="w-4 h-4" />
                Blog
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll indicator */}
      {!isWarping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button
            onClick={() => {
              const aboutSection = document.getElementById("about");
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Scroll to about section"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon name="arrow-down" className="w-5 h-5" />
            </motion.div>
          </button>
        </motion.div>
      )}
    </section>
  );
}
