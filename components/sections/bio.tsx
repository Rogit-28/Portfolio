"use client";

import { motion } from "framer-motion";
import siteData from "@/data/site.json";

export function Bio() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold mb-6">About</h2>
      <div className="prose max-w-none">
        <p className="text-muted-foreground leading-relaxed text-lg">
          {siteData.bio.long}
        </p>
      </div>
    </motion.section>
  );
}
