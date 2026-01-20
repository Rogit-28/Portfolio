"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "@/lib/utils";
import siteData from "@/data/site.json";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Experience", href: "/experience" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: siteData.blog.url, external: true },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

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
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex items-center justify-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 leading-none",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="flex items-center gap-1">
                {item.name}
                {item.external && (
                  <svg
                    className="w-3 h-3 -mr-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
                {item.external && (
                  <span className="sr-only">(opens in new tab)</span>
                )}
              </span>
            </Link>
          ))}
        </nav>
      </motion.header>

      {/* Mobile: Hamburger button */}
      <motion.header 
        className="fixed top-4 left-4 z-50 md:hidden"
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: hidden && !mobileMenuOpen ? -80 : 0,
          opacity: hidden && !mobileMenuOpen ? 0 : 1,
        }}
        transition={{
          duration: 0.4,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <button
          ref={buttonRef}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-full glass-pill"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </motion.header>

      {/* Mobile: Dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}
      <nav
        ref={menuRef}
        id="mobile-menu"
        className={cn(
          "fixed top-16 left-4 right-4 z-50 md:hidden rounded-2xl glass-pill overflow-hidden transition-all duration-200",
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <ul className="p-2 space-y-1">
          {navigation.map((item, index) => (
            <li key={item.name}>
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-white/20 dark:hover:bg-white/10"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
                tabIndex={mobileMenuOpen ? 0 : -1}
              >
                <span>{item.name}</span>
                {item.external && (
                  <>
                    <svg
                      className="w-4 h-4 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span className="sr-only">(opens in new tab)</span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

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
