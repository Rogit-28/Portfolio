"use client";

import { motion } from "framer-motion";
import { Tag } from "@/components/ui/tag";
import siteData from "@/data/site.json";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export function Skills() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="py-6"
    >
      <h2 className="text-2xl font-semibold mb-6">Skills & Interests</h2>

      <div className="space-y-6">
        {/* Languages */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Languages
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {siteData.skills.languages.map((skill) => (
              <motion.div key={skill} variants={item}>
                <Tag variant="accent">{skill}</Tag>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tools & Frameworks */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Tools & Frameworks
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {siteData.skills.tools.map((skill) => (
              <motion.div key={skill} variants={item}>
                <Tag>{skill}</Tag>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Areas of Interest */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Areas of Interest
          </h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {siteData.skills.interests.map((interest) => (
              <motion.div key={interest} variants={item}>
                <Tag>{interest}</Tag>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
