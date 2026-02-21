"use client";

import { useEffect, useRef } from "react";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

const WASD_CODE = [
  "KeyW",
  "KeyW",
  "KeyS",
  "KeyS",
  "KeyA",
  "KeyD",
  "KeyA",
  "KeyD",
  "Space",
  "Space",
];

export function useKonamiCode(callback: () => void) {
  const keySequence = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keySequence.current.push(e.code);

      if (keySequence.current.length > 10) {
        keySequence.current = keySequence.current.slice(-10);
      }

      const isKonami = keySequence.current.every(
        (key, index) => key === KONAMI_CODE[index]
      );

      const isWASD = keySequence.current.every(
        (key, index) => key === WASD_CODE[index]
      );

      if (isKonami || isWASD) {
        keySequence.current = [];
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [callback]);
}
