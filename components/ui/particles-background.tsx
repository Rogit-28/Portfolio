"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

// ============================================
// Star Wars Hyperspace Canvas Animation
// Themed: crimson/red accent (#DC2626)
//
// Timeline:
//   Phase 1 (0-400ms):       Static starfield with twinkle
//   Phase 2 (400-650ms):     Stars begin stretching outward
//   Phase 3 (650-2200ms):    Full hyperspace streaking
//   Phase 4 (2200-3400ms):   Deceleration - streaks shorten, dim, and dissolve
//                            Canvas bg fades from black to transparent
//                            At end: canvas removed, tsparticles fades in
// ============================================

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  speed: number;
  brightness: number;
  hue: number;
}

function createStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.8 + 0.05;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    stars.push({
      x,
      y,
      z: Math.random(),
      prevX: x,
      prevY: y,
      speed: 0.3 + Math.random() * 0.7,
      brightness: 0.4 + Math.random() * 0.6,
      hue: Math.random(),
    });
  }
  return stars;
}

function HyperspaceCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>(createStars(350));
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    startTimeRef.current = performance.now();

    const STATIC_END = 400;
    const RAMP_END = 650;
    const STREAK_END = 2200;
    const DECEL_END = 3400;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      let clearAlpha: number;
      let streakIntensity = 0;
      let speedFactor = 0;
      let fadeOut = 0; // 0->1 during decel, controls star opacity dissolve

      if (elapsed < STATIC_END) {
        clearAlpha = 1;
      } else if (elapsed < RAMP_END) {
        const t = (elapsed - STATIC_END) / (RAMP_END - STATIC_END);
        clearAlpha = 1 - t * 0.65;
        streakIntensity = t * t * 0.3;
        speedFactor = t * t * 0.01;
      } else if (elapsed < STREAK_END) {
        const t = (elapsed - RAMP_END) / (STREAK_END - RAMP_END);
        clearAlpha = 0.35 - t * 0.15;
        streakIntensity = 0.3 + t * 0.7;
        speedFactor = 0.01 + t * 0.04;
      } else if (elapsed < DECEL_END) {
        // Deceleration: streaks shorten, stars fade out entirely
        const t = (elapsed - STREAK_END) / (DECEL_END - STREAK_END);
        const eased = t * t;
        clearAlpha = 0.2 + eased * 0.8;
        streakIntensity = 1 - eased;
        speedFactor = 0.05 * (1 - eased * eased);
        fadeOut = eased; // stars dissolve away
      } else {
        // Done
        clearAlpha = 1;
        streakIntensity = 0;
        speedFactor = 0;
        fadeOut = 1;
      }

      if (elapsed >= DECEL_END) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        return;
      }

      // Clear canvas - during decel, transition from black to transparent
      // by reducing the black fill opacity so page bg bleeds through
      const bgOpacity = 1 - fadeOut * 0.7; // 1.0 -> 0.3
      ctx.fillStyle = `rgba(0, 0, 0, ${clearAlpha * bgOpacity})`;
      ctx.fillRect(0, 0, w, h);

      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.prevX = star.x;
        star.prevY = star.y;

        if (speedFactor > 0) {
          const distFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
          const angle = Math.atan2(star.y, star.x);
          const moveAmount = speedFactor * star.speed * (0.5 + distFromCenter * 2) * (0.5 + star.z);
          star.x += Math.cos(angle) * moveAmount;
          star.y += Math.sin(angle) * moveAmount;
          star.z = Math.min(star.z + speedFactor * 0.3, 1);
        }

        // Respawn at center if out of bounds
        if (Math.abs(star.x) > 1.2 || Math.abs(star.y) > 1.2) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.01 + Math.random() * 0.08;
          star.x = Math.cos(angle) * radius;
          star.y = Math.sin(angle) * radius;
          star.prevX = star.x;
          star.prevY = star.y;
          star.z = Math.random() * 0.3;
          star.speed = 0.3 + Math.random() * 0.7;
          star.brightness = 0.4 + Math.random() * 0.6;
          star.hue = Math.random();
        }

        // Screen coordinates
        const scale = Math.max(w, h);
        const sx = cx + star.x * scale;
        const sy = cy + star.y * scale;
        const spx = cx + star.prevX * scale;
        const spy = cy + star.prevY * scale;

        const size = (0.5 + star.z * 2) * (1 + streakIntensity * 0.5);
        // Fade out star opacity during deceleration
        const baseAlpha = star.brightness * (0.6 + streakIntensity * 0.4);
        const alpha = baseAlpha * (1 - fadeOut);

        // Skip drawing if fully transparent
        if (alpha < 0.01) continue;

        // Color - gradual white-to-crimson shift through Phase 3+4
        // crimsonT: 0 at start of streaking, ~1 by end of Phase 3, stays 1 in Phase 4
        // Each star shifts at slightly different rate based on hue for visual variety
        const crimsonT = Math.min(streakIntensity + fadeOut, 1);
        // Per-star variation: some stars shift earlier (hue acts as offset)
        const starShift = Math.min(crimsonT * (0.7 + star.hue * 0.6), 1);

        // Lerp from white (255,255,255) toward crimson (220,38,38)
        let r: number, g: number, b: number;
        r = Math.floor(255 + (220 - 255) * starShift); // 255 -> 220
        g = Math.floor(255 + (38 - 255) * starShift);  // 255 -> 38
        b = Math.floor(255 + (38 - 255) * starShift);  // 255 -> 38

        if (streakIntensity > 0.05) {
          const streakLen = Math.sqrt((sx - spx) ** 2 + (sy - spy) ** 2);
          if (streakLen > 0.5) {
            ctx.beginPath();
            ctx.moveTo(spx, spy);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.85})`;
            ctx.lineWidth = size * 0.8;
            ctx.lineCap = "round";
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2);
            // Head glow shifts from warm white toward bright crimson
            const headR = Math.floor(255);
            const headG = Math.floor(240 + (60 - 240) * starShift); // 240 -> 60
            const headB = Math.floor(235 + (50 - 235) * starShift); // 235 -> 50
            ctx.fillStyle = `rgba(${headR}, ${headG}, ${headB}, ${alpha})`;
            ctx.fill();
          }
        } else {
          // Static dot with twinkle
          const twinkle = 0.7 + 0.3 * Math.sin(elapsed * 0.005 * star.speed + star.brightness * 10);
          const staticG = star.hue > 0.7 ? 200 : 255;
          const staticB = star.hue > 0.7 ? 200 : 255;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, ${staticG}, ${staticB}, ${alpha * twinkle})`;
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-10"
      style={{ background: "transparent" }}
    />
  );
}

// ============================================
// Main ParticlesBackground Component
// ============================================

export function ParticlesBackground({ onWarpComplete }: { onWarpComplete?: () => void }) {
  const [particlesInit, setParticlesInit] = useState(false);
  const [hyperspaceActive, setHyperspaceActive] = useState(true);
  const [showAmbient, setShowAmbient] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Scroll-linked fade: particles become transparent as user scrolls toward About
  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const vh = window.innerHeight;
      // Fade from full opacity at top to 0 at 80% scroll of viewport
      const scrollFraction = Math.min(window.scrollY / (vh * 0.8), 1);
      wrapperRef.current.style.opacity = String(1 - scrollFraction);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize tsparticles engine on mount so ambient is ready when hyperspace ends
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const handleHyperspaceComplete = useCallback(() => {
    setHyperspaceActive(false);
    setShowAmbient(true);
    onWarpComplete?.();
  }, [onWarpComplete]);

  const ambientOptions: ISourceOptions = useMemo(() => ({
    fullScreen: false,
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: {
        value: 75,
        density: { enable: true, width: 1920, height: 1080 },
      },
      color: { value: "#DC2626" },
      opacity: { value: { min: 0.35, max: 0.7 } },
      size: { value: { min: 1.2, max: 3 } },
      shape: { type: "circle" },
      move: {
        enable: true,
        speed: 0.3,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        color: "#DC2626",
        opacity: 0.22,
        distance: 120,
        width: 1,
      },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "grab" } },
      modes: { grab: { distance: 150, links: { opacity: 0.45 } } },
    },
    detectRetina: true,
  }), []);

  return (
    <div ref={wrapperRef} className="absolute inset-0 w-full h-full">
      {hyperspaceActive && (
        <HyperspaceCanvas onComplete={handleHyperspaceComplete} />
      )}

      {showAmbient && particlesInit && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ animation: "ambientFadeIn 1s ease-out forwards" }}
        >
          <Particles
            id="hero-particles"
            className="absolute inset-0 w-full h-full"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            options={ambientOptions}
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes ambientFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
