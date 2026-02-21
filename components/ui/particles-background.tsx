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
//   Phase 4 (2200-3200ms):   Deceleration - streaks shorten into dots
//   Phase 5 (3200-4800ms):   Firefly drift - gentle crimson dots float
//                            Canvas opacity fades out, tsparticles underneath
// ============================================

interface Star {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  speed: number;
  brightness: number;
  hue: number; // 0 = pure white, 1 = full red
  // Firefly drift direction (assigned during deceleration)
  driftAngle: number;
  driftSpeed: number;
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
      driftAngle: Math.random() * Math.PI * 2,
      driftSpeed: 0.0002 + Math.random() * 0.0004,
    });
  }
  return stars;
}

function HyperspaceCanvas({
  onComplete,
  onFadeStart,
}: {
  onComplete: () => void;
  onFadeStart: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>(createStars(350));
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef(false);
  const fadeStartedRef = useRef(false);

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
    const DECEL_END = 3200;
    const FIREFLY_END = 4800;

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
      let decelT = 0; // 0 during warp, ramps 0->1 during deceleration
      let fireflyT = 0; // 0->1 during firefly phase

      if (elapsed < STATIC_END) {
        // Phase 1: static starfield
        clearAlpha = 1;
        streakIntensity = 0;
        speedFactor = 0;
      } else if (elapsed < RAMP_END) {
        // Phase 2: acceleration ramp
        const t = (elapsed - STATIC_END) / (RAMP_END - STATIC_END);
        clearAlpha = 1 - t * 0.65;
        streakIntensity = t * t * 0.3;
        speedFactor = t * t * 0.01;
      } else if (elapsed < STREAK_END) {
        // Phase 3: full hyperspace
        const t = (elapsed - RAMP_END) / (STREAK_END - RAMP_END);
        clearAlpha = 0.35 - t * 0.15;
        streakIntensity = 0.3 + t * 0.7;
        speedFactor = 0.01 + t * 0.04;
      } else if (elapsed < DECEL_END) {
        // Phase 4: deceleration - streaks shorten, stars become dots
        decelT = (elapsed - STREAK_END) / (DECEL_END - STREAK_END);
        const eased = decelT * decelT; // ease-in for smooth braking feel
        clearAlpha = 0.2 + eased * 0.8; // 0.2 -> 1.0 (motion blur clears out)
        streakIntensity = 1 - eased; // 1 -> 0
        speedFactor = 0.05 * (1 - eased * eased); // braking curve
      } else if (elapsed < FIREFLY_END) {
        // Phase 5: firefly drift
        fireflyT = (elapsed - DECEL_END) / (FIREFLY_END - DECEL_END);
        clearAlpha = 1;
        streakIntensity = 0;
        speedFactor = 0;
        decelT = 1;
      } else {
        // Done
        clearAlpha = 1;
        streakIntensity = 0;
        speedFactor = 0;
        decelT = 1;
        fireflyT = 1;
      }

      // Fire onComplete at start of firefly phase so hero content starts revealing
      if (elapsed >= DECEL_END && !fadeStartedRef.current) {
        fadeStartedRef.current = true;
        onFadeStart();
      }

      // Canvas fully done
      if (elapsed >= FIREFLY_END) {
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
        return;
      }

      // Clear canvas
      ctx.fillStyle = `rgba(0, 0, 0, ${clearAlpha})`;
      ctx.fillRect(0, 0, w, h);

      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.prevX = star.x;
        star.prevY = star.y;

        if (fireflyT > 0) {
          // Firefly drift: gentle random wandering
          // Slowly rotate drift direction for organic movement
          star.driftAngle += (Math.sin(elapsed * 0.001 + i) * 0.02);
          star.x += Math.cos(star.driftAngle) * star.driftSpeed;
          star.y += Math.sin(star.driftAngle) * star.driftSpeed;
        } else if (speedFactor > 0) {
          // Warp/decel: radial outward movement
          const distFromCenter = Math.sqrt(star.x * star.x + star.y * star.y);
          const angle = Math.atan2(star.y, star.x);
          const moveAmount = speedFactor * star.speed * (0.5 + distFromCenter * 2) * (0.5 + star.z);
          star.x += Math.cos(angle) * moveAmount;
          star.y += Math.sin(angle) * moveAmount;
          star.z = Math.min(star.z + speedFactor * 0.3, 1);
        }

        // Respawn at random position if out of bounds
        if (Math.abs(star.x) > 1.2 || Math.abs(star.y) > 1.2) {
          if (decelT > 0.5 || fireflyT > 0) {
            // During decel/firefly: respawn scattered across viewport
            star.x = (Math.random() - 0.5) * 1.8;
            star.y = (Math.random() - 0.5) * 1.8;
          } else {
            // During warp: respawn at center
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.01 + Math.random() * 0.08;
            star.x = Math.cos(angle) * radius;
            star.y = Math.sin(angle) * radius;
          }
          star.prevX = star.x;
          star.prevY = star.y;
          star.z = Math.random() * 0.3;
          star.speed = 0.3 + Math.random() * 0.7;
          star.brightness = 0.4 + Math.random() * 0.6;
          star.hue = Math.random();
          star.driftAngle = Math.random() * Math.PI * 2;
          star.driftSpeed = 0.0002 + Math.random() * 0.0004;
        }

        // Screen coordinates
        const scale = Math.max(w, h);
        const sx = cx + star.x * scale;
        const sy = cy + star.y * scale;
        const spx = cx + star.prevX * scale;
        const spy = cy + star.prevY * scale;

        // During decel/firefly, transition color toward crimson #DC2626
        // and match ambient particle appearance (small, dim, red)
        const toFirefly = Math.max(decelT, fireflyT > 0 ? 1 : 0);

        // Size: shrink from warp size to ambient size (1-2.5px)
        const warpSize = (0.5 + star.z * 2) * (1 + streakIntensity * 0.5);
        const fireflySize = 1 + star.brightness * 1.5; // 1-2.5px matching ambient
        const size = warpSize + (fireflySize - warpSize) * toFirefly;

        // Opacity: transition to ambient range (0.2-0.5)
        const warpAlpha = star.brightness * (0.6 + streakIntensity * 0.4);
        const fireflyAlpha = 0.2 + star.brightness * 0.3; // 0.2-0.5 matching ambient
        const alpha = warpAlpha + (fireflyAlpha - warpAlpha) * toFirefly;

        // Color: transition all stars to crimson #DC2626 (220, 38, 38)
        const redShift = streakIntensity * 0.7;
        const isRedStar = star.hue > 0.4;

        let r: number, g: number, b: number;
        if (toFirefly > 0.5) {
          // Transitioning to firefly: lerp toward #DC2626
          const lerp = Math.min((toFirefly - 0.5) * 2, 1); // 0->1 over second half
          r = Math.floor(255 + (220 - 255) * lerp);
          g = Math.floor(200 + (38 - 200) * lerp);
          b = Math.floor(200 + (38 - 200) * lerp);
        } else if (isRedStar && streakIntensity > 0.05) {
          const intensity = redShift * star.hue;
          r = Math.floor(220 + (35 * (1 - intensity)));
          g = Math.floor(255 - intensity * 217);
          b = Math.floor(255 - intensity * 217);
        } else {
          r = 255;
          g = Math.floor(255 - redShift * 30);
          b = Math.floor(255 - redShift * 50);
        }

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
            ctx.fillStyle = `rgba(255, 240, 235, ${alpha})`;
            ctx.fill();
          }
        } else {
          // Dot (static, decel endpoint, or firefly)
          const twinkle = fireflyT > 0
            ? 0.8 + 0.2 * Math.sin(elapsed * 0.003 * star.speed + i * 1.7)
            : 0.7 + 0.3 * Math.sin(elapsed * 0.005 * star.speed + star.brightness * 10);
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * twinkle})`;
          ctx.fill();
        }
      }

      // Radial vignette during streaks (fades out with deceleration)
      if (streakIntensity > 0.1) {
        const vigGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6);
        const centerGlow = streakIntensity * 0.06;
        vigGrad.addColorStop(0, `rgba(220, 38, 38, ${centerGlow})`);
        vigGrad.addColorStop(0.3, `rgba(180, 20, 20, ${centerGlow * 0.4})`);
        vigGrad.addColorStop(0.6, "rgba(0, 0, 0, 0)");
        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${streakIntensity * 0.35})`);
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [onComplete, onFadeStart]);

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
  const [showAmbient, setShowAmbient] = useState(false);
  const [canvasFading, setCanvasFading] = useState(false);

  const initEngine = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);
    setHyperspaceActive(true);

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

  // Called when firefly phase begins - start crossfade
  const handleFadeStart = useCallback(() => {
    setCanvasFading(true);
    setShowAmbient(true);
    onWarpComplete?.();
  }, [onWarpComplete]);

  // Called when canvas animation is fully done - remove canvas
  const handleHyperspaceComplete = useCallback(() => {
    setHyperspaceActive(false);
  }, []);

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
      {hyperspaceActive && (
        <div
          className="absolute inset-0 w-full h-full z-10"
          style={canvasFading ? {
            animation: "canvasFadeOut 1.6s ease-in forwards",
          } : undefined}
        >
          <HyperspaceCanvas
            onComplete={handleHyperspaceComplete}
            onFadeStart={handleFadeStart}
          />
        </div>
      )}

      {showAmbient && particlesInit && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ animation: "ambientFadeIn 1.6s ease-out forwards" }}
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
        @keyframes canvasFadeOut {
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
