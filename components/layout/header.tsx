"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
];



export function Header() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const router = useRouter();

  const mobileItems = useMemo(() => navigation, []);
  const currentMobileIndex = Math.max(
    0,
    mobileItems.findIndex((item) => item.href === pathname)
  );
  const currentMobileItem = mobileItems[currentMobileIndex] ?? mobileItems[0];

  const goToMobileIndex = (nextIndex: number) => {
    const normalizedIndex =
      (nextIndex + mobileItems.length) % mobileItems.length;
    const nextItem = mobileItems[normalizedIndex];
    if (nextItem) {
      router.push(nextItem.href);
    }
  };

  // Hide/show navbar based on scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const direction = latest > previous ? "down" : "up";

    // Only hide after scrolling past 100px
    if (latest > 100) {
      setHidden(direction === "down");
    } else {
      setHidden(false);
    }

    lastScrollY.current = latest;
  });

  return (
    <>
      {/* Desktop: Centered pill navbar */}
      <motion.header 
        className="fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center px-4"
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: hidden ? -80 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <nav
          className="inline-flex items-center gap-1.5 px-2 py-2 rounded-full glass-pill"
          role="navigation"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 leading-none",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="flex items-center gap-1">{item.name}</span>
            </Link>
          ))}
        </nav>
      </motion.header>

      {/* Mobile: Navigation capsule */}
      <motion.header
        className="fixed top-4 left-0 right-0 z-50 md:hidden flex justify-center px-4"
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: hidden ? -80 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <motion.nav
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-pill"
          role="navigation"
          aria-label="Mobile navigation"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.4}
          onDragEnd={(_, info) => {
            if (info.offset.x > 50) {
              goToMobileIndex(currentMobileIndex - 1);
            } else if (info.offset.x < -50) {
              goToMobileIndex(currentMobileIndex + 1);
            }
          }}
        >
          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={() => goToMobileIndex(currentMobileIndex - 1)}
            aria-label="Previous page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <Link
            href={currentMobileItem?.href || "/"}
            className="text-sm font-semibold text-foreground px-3"
            aria-current="page"
          >
            {currentMobileItem?.name?.toUpperCase() || "HOME"}
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            onClick={() => goToMobileIndex(currentMobileIndex + 1)}
            aria-label="Next page"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.nav>
      </motion.header>

      {/* Floating theme toggle - right corner */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: hidden ? -80 : 0,
          opacity: hidden ? 0 : 1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <ThemeToggle />
      </motion.div>
    </>
  );
}
