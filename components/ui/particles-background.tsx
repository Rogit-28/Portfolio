"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      background: {
        color: {
          value: "transparent",
        },
      },
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
        color: {
          value: "#DC2626",
        },
        opacity: {
          value: { min: 0.2, max: 0.5 },
        },
        size: {
          value: { min: 1, max: 2.5 },
        },
        move: {
          enable: true,
          speed: 0.3,
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
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
          onHover: {
            enable: true,
            mode: "grab",
          },
        },
        modes: {
          grab: {
            distance: 150,
            links: {
              opacity: 0.3,
            },
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <Particles
      id="hero-particles"
      className="absolute inset-0 w-full h-full"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      options={options}
    />
  );
}
