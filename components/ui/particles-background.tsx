"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

// ============================================
// Star Wars Hyperspace Canvas Animation
// ============================================

interface Star {
  x: number;      // position relative to center (-1 to 1)
  y: number;      // position relative to center (-1 to 1)
  z: number;      // depth (0 = far, 1 = near)
  prevX: number;
  prevY: number;
  speed: number;   // individual speed multiplier
  brightness: number;
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
    });
  }
  return stars;
}

function HyperspaceCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>(createStars(300));
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI support
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

    // Timeline:
    // 0-400ms:      Static starfield, subtle twinkle
    // 400-600ms:    Stars begin to stretch (acceleration ramp)
    // 600-2200ms:   Full hyperspace streaking
    // 2200-2800ms:  White flash builds up
    // 2800-3400ms:  White flash peak + fade to reveal ambient
    const STATIC_END = 400;
    const RAMP_END = 600;
    const STREAK_END = 2200;
    const FLASH_PEAK = 2800;
    const TOTAL_DURATION = 3400;

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      // Clear
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, w, h);

      if (elapsed >= TOTAL_DURATION) {
        // Final white flash fade-out
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        return;
      }

      // Calculate streak intensity (0 = dots, 1 = full streaks)
      let streakIntensity = 0;
      let speedFactor = 0;

      if (elapsed < STATIC_END) {
        // Static starfield
        streakIntensity = 0;
        speedFactor = 0;
      } else if (elapsed < RAMP_END) {
        // Ramp up — exponential ease in
        const t = (elapsed - STATIC_END) / (RAMP_END - STATIC_END);
        streakIntensity = t * t * 0.3;
        speedFactor = t * t * 0.01;
      } else if (elapsed < STREAK_END) {
        // Full hyperspace
        const t = (elapsed - RAMP_END) / (STREAK_END - RAMP_END);
        // Accelerate further during the streak phase
        streakIntensity = 0.3 + t * 0.7;
        speedFactor = 0.01 + t * 0.04;
      } else if (elapsed < FLASH_PEAK) {
        streakIntensity = 1;
        speedFactor = 0.05;
      } else {
        streakIntensity = 1;
        speedFactor = 0.05;
      }

      // White flash overlay
      let flashOpacity = 0;
      if (elapsed > STREAK_END) {
        if (elapsed < FLASH_PEAK) {
          // Build up flash
          const t = (elapsed - STREAK_END) / (FLASH_PEAK - STREAK_END);
          flashOpacity = t * t * 0.95;
        } else {
          // Peak and sustain
          flashOpacity = 0.95;
        }
      }

      // Update and draw stars
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Store previous position for streak lines
        star.prevX = star.x;
        star.prevY = star.y;

        // Move star outward from center (closer z = faster)
        if (speedFactor > 0) {
          const distFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
          const angle = Math.atan2(star.y, star.x);
          // Stars further from center move faster (perspective)
          const moveAmount = speedFactor * star.speed * (0.5 + distFromCenter * 2) * (0.5 + star.z);
          star.x += Math.cos(angle) * moveAmount;
          star.y += Math.sin(angle) * moveAmount;
          star.z = Math.min(star.z + speedFactor * 0.3, 1);
        }

        // Respawn if out of bounds
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
        }

        // Screen coordinates
        const sx = cx + star.x * Math.max(w, h);
        const sy = cy + star.y * Math.max(w, h);
        const spx = cx + star.prevX * Math.max(w, h);
        const spy = cy + star.prevY * Math.max(w, h);

        // Size based on z-depth
        const size = (0.5 + star.z * 2) * (1 + streakIntensity * 0.5);

        // Color: white with blue-ish tint at high speed, red accent tint mixed in
        const blueShift = streakIntensity * 0.4;
        const r = Math.floor(255 - blueShift * 40);
        const g = Math.floor(255 - blueShift * 20);
        const b = 255;
        const alpha = star.brightness * (0.6 + streakIntensity * 0.4);

        if (streakIntensity > 0.05) {
          // Draw streak line
          const streakLen = Math.sqrt((sx - spx) ** 2 + (sy - spy) ** 2);
          if (streakLen > 0.5) {
            ctx.beginPath();
            ctx.moveTo(spx, spy);
            ctx.lineTo(sx, sy);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = size * 0.8;
            ctx.lineCap = "round";
            ctx.stroke();

            // Bright head of the streak
            ctx.beginPath();
            ctx.arc(sx, sy, size * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
          }
        } else {
          // Draw dot with subtle twinkle
          const twinkle = 0.7 + 0.3 * Math.sin(elapsed * 0.005 * star.speed + star.brightness * 10);
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * twinkle})`;
          ctx.fill();
        }
      }

      // Draw subtle radial vignette (darker at edges, brighter center during streak)
      if (streakIntensity > 0.1) {
        const vigGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        const centerGlow = streakIntensity * 0.08;
        vigGrad.addColorStop(0, `rgba(180, 200, 255, ${centerGlow})`);
        vigGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${streakIntensity * 0.3})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // White flash overlay
      if (flashOpacity > 0) {
        // Radial flash — brighter at center
        const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashOpacity})`);
        flashGrad.addColorStop(0.4, `rgba(220, 230, 255, ${flashOpacity * 0.8})`);
        flashGrad.addColorStop(1, `rgba(200, 210, 255, ${flashOpacity * 0.5})`);
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, w, h);
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
      style={{ background: "#000" }}
    />
  );
}

// ============================================
// Main ParticlesBackground Component
// ============================================

export function ParticlesBackground({ onWarpComplete }: { onWarpComplete?: () => void }) {
  const [particlesInit, setParticlesInit] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hyperspaceActive, setHyperspaceActive] = useState(false);
  const [hyperspaceDone, setHyperspaceDone] = useState(false);
  const [showAmbient, setShowAmbient] = useState(false);

  // Initialize tsparticles engine eagerly (but don't render yet)
  const initEngine = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);
    setHyperspaceActive(true);

    // Pre-init the particles engine while hyperspace plays
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, [hasInteracted]);

  useEffect(() => {
    const handleInteraction = () => initEngine();

    const events = [
      ["mousemove", handleInteraction],
      ["click", handleInteraction],
      ["touchstart", handleInteraction],
      ["scroll", handleInteraction],
      ["keydown", handleInteraction],
    ] as const;

    events.forEach(([eventName, handler]) => {
      window.addEventListener(eventName, handler, { once: true });
    });

    return () => {
      events.forEach(([eventName, handler]) => {
        window.removeEventListener(eventName, handler as EventListener);
      });
    };
  }, [initEngine]);

  const handleHyperspaceComplete = useCallback(() => {
    setHyperspaceDone(true);
    // Short delay for the white flash to fade, then show ambient particles
    setTimeout(() => {
      setHyperspaceActive(false);
      setShowAmbient(true);
      onWarpComplete?.();
    }, 100);
  }, [onWarpComplete]);

  // Ambient tsparticles options (red network)
  const ambientOptions: ISourceOptions = useMemo(() => ({
    fullScreen: false,
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: {
        value: 50,
        density: { enable: true, width: 1920, height: 1080 },
      },
      color: { value: "#DC2626" },
      opacity: { value: { min: 0.2, max: 0.5 } },
      size: { value: { min: 1, max: 2.5 } },
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
        opacity: 0.15,
        distance: 120,
        width: 1,
      },
    },
    interactivity: {
      events: { onHover: { enable: true, mode: "grab" } },
      modes: { grab: { distance: 150, links: { opacity: 0.3 } } },
    },
    detectRetina: true,
  }), []);

  return (
    <>
      {/* Star Wars Hyperspace Canvas */}
      {hyperspaceActive && (
        <HyperspaceCanvas onComplete={handleHyperspaceComplete} />
      )}

      {/* Canvas fade-out overlay — smooth transition from hyperspace white flash to ambient */}
      {hyperspaceDone && !showAmbient && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: "white",
            animation: "hyperspaceReveal 0.6s ease-out forwards",
          }}
        />
      )}

      {/* Ambient tsparticles (red network) — fades in after hyperspace */}
      {showAmbient && particlesInit && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ animation: "ambientFadeIn 1.2s ease-out forwards" }}
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
        @keyframes hyperspaceReveal {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes ambientFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
