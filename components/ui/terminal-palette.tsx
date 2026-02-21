"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./icon";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

interface Command {
  name: string;
  description: string;
  action: () => void | Promise<void>;
  keywords?: string[];
}

interface TerminalHistoryItem {
  input: string;
  output?: string;
  timestamp: number;
}

export function TerminalPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalHistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<string>("");
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setTheme } = useTheme();

  const siteData = {
    name: "Portfolio Owner",
  };

  const commands: Command[] = [
    {
      name: "home",
      description: "Navigate to home page",
      action: () => router.push("/"),
      keywords: ["navigate", "home"],
    },
    {
      name: "experience",
      description: "View experience",
      action: () => router.push("/experience"),
      keywords: ["navigate", "experience", "work"],
    },
    {
      name: "projects",
      description: "View projects",
      action: () => router.push("/projects"),
      keywords: ["navigate", "project"],
    },
    {
      name: "about",
      description: "Scroll to about section",
      action: () => {
        setIsOpen(false);
        document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      },
      keywords: ["scroll", "bio"],
    },
    {
      name: "contact",
      description: "Contact me",
      action: () => {
        setIsOpen(false);
        window.location.href = "mailto:hello@example.com";
      },
      keywords: ["email", "reach"],
    },
    {
      name: "theme",
      description: "Toggle dark/light mode",
      action: () => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
        setOutput("Theme toggled! 🎨");
      },
      keywords: ["dark", "light", "mode"],
    },
    {
      name: "random",
      description: "Get a random fun fact",
      action: () => {
        const facts = [
          "I once debugged for 6 hours before realizing I was working on the wrong branch",
          "My first program was 'Hello World' in Python... it still works!",
          "I prefer spaces over tabs (sorry not sorry)",
          "I've accidentally deployed to production twice... this year",
          "I break for coffee",
        ];
        setOutput(facts[Math.floor(Math.random() * facts.length)]);
      },
      keywords: ["fact", "fun"],
    },
    {
      name: "matrix",
      description: "🚨 Enter the Matrix",
      action: () => {
        setOutput("Matrix activated... look behind you 👀");
        setIsMatrixActive(true);
        setTimeout(() => setIsMatrixActive(false), 5000);
      },
      keywords: ["green", "code", "neo"],
    },
    {
      name: "sudo",
      description: "?",
      action: () => {
        const sudoOutputs = [
          "You're not root. Nice try though 🤨",
          "sudo make-me-a-sandwich",
          "Permission denied (but keep trying)",
          "I'd tell you, but then I'd have to... wait, actually I just don't know",
          "sudo: effective uid is not 0, is sudo installed?",
        ];
        setOutput(sudoOutputs[Math.floor(Math.random() * sudoOutputs.length)]);
      },
    },
    {
      name: "clear",
      description: "Clear terminal",
      action: () => {
        setHistory([]);
        setOutput("");
      },
      keywords: ["reset"],
    },
    {
      name: "help",
      description: "Show all commands",
      action: () => {
        const help = commands.map((c) => `  ${c.name.padEnd(12)} - ${c.description}`).join("\n");
        setOutput(`Available commands:\n${help}`);
      },
      keywords: ["commands", "list"],
    },
    {
      name: "sudo make-coffee",
      description: "☕",
      action: () => {
        setOutput("☕ Brewing coffee... Error: coffee machine not found. You'll have to go to the kitchen.");
      },
    },
    {
      name: "sudo make-sandwich",
      description: "🥪",
      action: () => {
        setOutput("🥪 Sandwich making is a privileged operation. Please make it yourself.");
      },
    },
  ];

  useEffect(() => {
    const storedHistory = sessionStorage.getItem("terminal-history");
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.warn("Failed to parse terminal history");
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("terminal-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, output]);

  const findCommand = (inputStr: string): Command | null => {
    const trimmed = inputStr.trim().toLowerCase();

    for (const cmd of commands) {
      if (cmd.name.toLowerCase() === trimmed) return cmd;
    }

    for (const cmd of commands) {
      if (cmd.keywords?.some((kw) => kw === trimmed)) return cmd;
    }

    return null;
  };

  const handleAutocomplete = useCallback(() => {
    const trimmed = input.trim().toLowerCase();
    const matches = commands.filter((cmd) => 
      cmd.name.toLowerCase().startsWith(trimmed)
    );

    if (matches.length === 1) {
      setInput(matches[0].name + " ");
    } else if (matches.length > 1) {
      setOutput(`Multiple matches: ${matches.map((m) => m.name).join(", ")}`);
    }
  }, [input, commands]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    const cmd = findCommand(trimmed);
    const result = cmd ? cmd.action() : `Command not found: ${trimmed}. Type 'help' for available commands.`;

    const resultStr = result instanceof Promise ? "Loading..." : String(result);

    const newHistoryItem: TerminalHistoryItem = {
      input: trimmed,
      output: resultStr || undefined,
      timestamp: Date.now(),
    };

    setHistory((prev) => [...prev, newHistoryItem]);
    setHistoryIndex(-1);
    setInput("");
    setOutput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex].input);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex].input);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const autocompleteMatches = input.trim() 
    ? commands.filter((cmd) => cmd.name.toLowerCase().startsWith(input.trim().toLowerCase()))
    : [];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Open terminal"
        title="Open terminal (⌘K)"
      >
        <Icon name="terminal" className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 md:inset-auto md:top-[15%] md:left-[calc(50%-20rem)] md:w-[40rem] md:max-h-[60vh] glass-strong rounded-lg overflow-hidden z-50 flex flex-col"
            >
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground font-mono">
                    guest@portfolio:~
                  </span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-background/50">
                <div className="space-y-2">
                  <div className="text-emerald-500 dark:text-emerald-400">
                    Welcome to {siteData.name}&apos;s terminal v1.0.0
                  </div>
                  <div className="text-muted-foreground mb-4">
                    Type &apos;help&apos; for available commands or press ⌘K to close
                  </div>

                  {history.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 dark:text-emerald-400">$</span>
                        <span className="text-foreground">{item.input}</span>
                      </div>
                      {item.output && (
                        <div className="text-muted-foreground pl-4 whitespace-pre-wrap">
                          {item.output}
                        </div>
                      )}
                    </div>
                  ))}

                  {output && (
                    <div className="text-muted-foreground pl-4 whitespace-pre-wrap" ref={outputRef}>
                      {output}
                    </div>
                  )}

                  {autocompleteMatches.length > 1 && (
                    <div className="text-muted-foreground text-xs pt-2">
                      <div className="text-emerald-500 dark:text-emerald-400">Suggestions:</div>
                      {autocompleteMatches.map((cmd) => (
                        <div key={cmd.name} className="pl-2">
                          {cmd.name} - {cmd.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <span className="text-emerald-500 dark:text-emerald-400 font-mono text-sm">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none font-mono text-sm text-foreground"
                    placeholder="Type a command..."
                    autoComplete="off"
                    autoFocus
                  />
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-2 h-4 bg-emerald-500 dark:bg-emerald-400"
                  />
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isMatrixActive && <MatrixEffect />}
    </>
  );
}

function MatrixEffect() {
  const [columns, setColumns] = useState<Array<{ chars: string[]; speed: number }>>([]);

  useEffect(() => {
    const charSet = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const colCount = Math.floor(window.innerWidth / 20);

    const initialColumns = Array.from({ length: colCount }, () => ({
      chars: Array.from({ length: 20 }, () => charSet[Math.floor(Math.random() * charSet.length)]),
      speed: 50 + Math.random() * 50,
    }));

    setColumns(initialColumns);

    const interval = setInterval(() => {
      setColumns((prev) =>
        prev.map((col) => {
          const newChars = [...col.chars];
          for (let i = newChars.length - 1; i > 0; i--) {
            newChars[i] = newChars[i - 1];
          }
          newChars[0] = charSet[Math.floor(Math.random() * charSet.length)];
          return { ...col, chars: newChars };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black pointer-events-none flex gap-[20px] overflow-hidden">
      {columns.map((col, idx) => (
        <div key={idx} className="flex flex-col text-green-500 text-sm font-mono" style={{ animationDuration: `${col.speed}ms` }}>
          {col.chars.map((char, charIdx) => (
            <span
              key={charIdx}
              className={charIdx === 0 ? "text-green-300 text-sm font-bold" : "text-green-600 opacity-70"}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
