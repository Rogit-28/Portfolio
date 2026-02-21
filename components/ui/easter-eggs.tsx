"use client";

import { useKonamiCode } from "@/lib/use-konami-code";
import { useState, useEffect } from "react";

export function EasterEggs() {
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const triggerEasterEgg = () => {
    const messages = [
      "🎮 Konami Code Activated! You found the secret!",
      "👾 You're a true gamer!",
      "🕹️ Cheat codes enabled! (just kidding)",
      "🏆 Achievement Unlocked: Konami Master",
    ];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 5000);
  };

  useKonamiCode(triggerEasterEgg);

  useEffect(() => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   🎉 You found the secret console!  🎉   ║
    ║                                       ║
    ║   Try these commands in the terminal:  ║
    ║   - sudo                              ║
    ║   - matrix                            ║
    ║   - random                            ║
    ║   - sudo make-coffee                  ║
    ║                                       ║
    ║   Press ⌘K to open the terminal       ║
    ║                                       ║
    ║   ↑↑↓↓←→←→BA or WASD variant for surprise ║
    ╚═══════════════════════════════════════╝
    `);
  }, []);

  return (
    <>
      {showMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/90 to-cyan-500/90 text-white rounded-lg shadow-lg text-center">
            {message}
          </div>
        </div>
      )}

      <style jsx global>{`
        body::after {
          content: "${message}";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          font-weight: bold;
          color: rgba(16, 185, 129, 0.1);
          pointer-events: none;
          z-index: 0;
          opacity: ${showMessage ? 1 : 0};
          transition: opacity 0.3s ease;
        }
      `}</style>
    </>
  );
}
