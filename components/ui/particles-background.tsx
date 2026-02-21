"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function ParticlesBackground({ onWarpComplete }: { onWarpComplete?: () => void }) {
  const [init, setInit] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isWarping, setIsWarping] = useState(true);
  const [warpPhase, setWarpPhase] = useState<"start" | "accelerating" | "braking" | "decelerating" | "normal">("start");

  const initializeParticles = useCallback(() => {
    if (!hasInteracted && !init) {
      setHasInteracted(true);

      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        setInit(true);
        setWarpPhase("accelerating");

        // Step 1: Full speed warp — 0ms to 1800ms
        // Step 2: Begin braking — 1800ms to 2600ms (soft mid-step)
        setTimeout(() => {
          setWarpPhase("braking");
        }, 1800);

        // Step 3: Heavy deceleration — 2600ms to 3600ms
        setTimeout(() => {
          setWarpPhase("decelerating");
        }, 2600);

        // Step 4: Drop out of warp — overlay fades, dots appear
        setTimeout(() => {
          setWarpPhase("normal");
          setIsWarping(false);
          onWarpComplete?.();
        }, 3800);
      });
    }
  }, [hasInteracted, init, onWarpComplete]);

  useEffect(() => {
    const handleInteraction = () => {
      initializeParticles();
    };

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
  }, [initializeParticles]);

  const options: ISourceOptions = useMemo(() => {
    if (isWarping) {
      const speedMultiplier =
        warpPhase === "accelerating" ? 1
        : warpPhase === "braking" ? 0.55
        : warpPhase === "decelerating" ? 0.2
        : 0;

      const particleCount =
        warpPhase === "accelerating" ? 220
        : warpPhase === "braking" ? 160
        : 100;

      const trailLength =
        warpPhase === "accelerating" ? 28
        : warpPhase === "braking" ? 16
        : 8;

      const opacityMax =
        warpPhase === "accelerating" ? 0.9
        : warpPhase === "braking" ? 0.65
        : 0.35;

      return {
        fullScreen: false,
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          number: {
            value: particleCount,
            density: { enable: false },
          },
          color: {
            value: ["#DC2626", "#ffffff", "#ffcccc", "#ff9999", "#ffe6e6"],
          },
          opacity: {
            value: { min: 0.1, max: opacityMax },
            animation: {
              enable: true,
              speed: 0.8,
              minimumValue: 0.1,
            },
          },
          size: {
            value: { min: 0.5, max: 2.5 },
          },
          shape: {
            type: "line",
          },
          stroke: {
            color: "#DC2626",
            width: 1,
          },
          move: {
            enable: true,
            speed: 22 * speedMultiplier,
            // Radiate outward from center — true warp effect
            direction: "none",
            random: true,
            straight: false,
            outModes: {
              default: "out",
            },
            trail: {
              enable: true,
              length: trailLength,
              fillColor: { value: "#DC2626" },
            },
          },
          links: {
            enable: false,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: false },
          },
        },
        detectRetina: true,
      };
    }

    // Normal ambient state
    return {
      fullScreen: false,
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        number: {
          value: 50,
          density: {
            enable: true,
            width: 1920,
            height: 1080,
          },
        },
        color: { value: "#DC2626" },
        opacity: {
          value: { min: 0.2, max: 0.5 },
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
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
        events: {
          onHover: { enable: true, mode: "grab" },
        },
        modes: {
          grab: {
            distance: 150,
            links: { opacity: 0.3 },
          },
        },
      },
      detectRetina: true,
    };
  }, [isWarping, warpPhase]);

  if (!init) return null;

  // Overlay: flash white on enter, blur + fade as we drop out of warp
  const overlayStyle: React.CSSProperties =
    warpPhase === "accelerating"
      ? {
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(220,38,38,0.55) 35%, rgba(0,0,0,0.96) 100%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          animation: "warpFlash 0.45s ease-out forwards",
        }
      : {
          background:
            "radial-gradient(ellipse at center, rgba(220,38,38,0.25) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.97) 100%)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
          animation: "warpFadeOut 2.0s ease-out forwards",
        };

  return (
    <>
      {isWarping && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={overlayStyle}
        />
      )}
      <style jsx global>{`
        @keyframes warpFlash {
          0% {
            opacity: 0;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
            transform: scale(0.5);
          }
          25% {
            opacity: 1;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            transform: scale(1);
          }
          100% {
            opacity: 1;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transform: scale(1);
          }
        }
        @keyframes warpFadeOut {
          0% {
            opacity: 1;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
          40% {
            opacity: 0.6;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
          }
          100% {
            opacity: 0;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
          }
        }
      `}</style>
      <Particles
        id="hero-particles"
        className="absolute inset-0 w-full h-full"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        options={options}
      />
    </>
  );
}
