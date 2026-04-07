"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTerminal, FaTimes } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import siteData from "@/data/site.json";
import experienceData from "@/data/experience.json";

interface Command {
  name: string;
  description: string;
  action: () => void | string | Promise<void>;
  keywords?: string[];
}

// ASCII art for neofetch/whoami
const ASCII_LOGO = `
   ____            _ _   
  |  _ \\ ___   __ _(_) |_ 
  | |_) / _ \\ / _\` | | __|
  |  _ < (_) | (_| | | |_ 
  |_| \\_\\___/ \\__, |_|\\__|
              |___/       
`.trim();

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
        window.location.href = `mailto:${siteData.email}`;
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
    // ===== DATA COMMANDS =====
    {
      name: "whoami",
      description: "Display user identity and info",
      action: () => {
        const info = [
          ASCII_LOGO,
          "",
          `  Name:     ${siteData.name}`,
          `  Title:    ${siteData.title}`,
          `  Location: ${siteData.location}`,
          `  Email:    ${siteData.email}`,
          "",
          `  "${siteData.bio.short}"`,
        ].join("\n");
        setOutput(info);
      },
      keywords: ["me", "identity", "user"],
    },
    {
      name: "neofetch",
      description: "Display system info (portfolio style)",
      action: () => {
        const workCount = experienceData.work.length;
        const skillCount = siteData.skills.languages.length + siteData.skills.tools.length;
        const researchCount = siteData.research.length;
        
        const lines = ASCII_LOGO.split("\n");
        const info = [
          `guest@rogit.me`,
          `─────────────────────`,
          `OS: Portfolio v2.0`,
          `Host: ${siteData.institution}`,
          `Kernel: Next.js 16 + TypeScript`,
          `Uptime: ${new Date().getFullYear() - 2022} years (since college)`,
          `Packages: ${skillCount} skills installed`,
          `Shell: terminal-palette.tsx`,
          `Terminal: 80x24`,
          `CPU: ${siteData.name}`,
          `Memory: ${workCount} internships / ${researchCount} papers`,
          ``,
          `[Languages] ${siteData.skills.languages.join(", ")}`,
          `[Focus] ${siteData.tagline.join(" • ")}`,
        ];
        
        // Combine ASCII art with info side by side
        const maxLines = Math.max(lines.length, info.length);
        const combined = [];
        for (let i = 0; i < maxLines; i++) {
          const artLine = (lines[i] || "").padEnd(30);
          const infoLine = info[i] || "";
          combined.push(`${artLine}${infoLine}`);
        }
        setOutput(combined.join("\n"));
      },
      keywords: ["fetch", "sysinfo", "system"],
    },
    {
      name: "skills",
      description: "List technical skills",
      action: () => {
        const { languages, tools, interests, soft } = siteData.skills;
        const output = [
          "┌─ Languages ─────────────────────────┐",
          `│  ${languages.join(", ")}`,
          "├─ Tools & Frameworks ────────────────┤",
          `│  ${tools.slice(0, 6).join(", ")}`,
          `│  ${tools.slice(6).join(", ")}`,
          "├─ Interests ─────────────────────────┤",
          `│  ${interests.slice(0, 4).join(", ")}`,
          `│  ${interests.slice(4).join(", ")}`,
          "├─ Soft Skills ───────────────────────┤",
          `│  ${soft.join(", ")}`,
          "└──────────────────────────────────────┘",
        ].join("\n");
        setOutput(output);
      },
      keywords: ["tech", "stack", "technologies"],
    },
    {
      name: "education",
      description: "View education details",
      action: () => {
        const edu = experienceData.education[0];
        const output = [
          "🎓 EDUCATION",
          "─".repeat(40),
          `  ${edu.degree} in ${edu.field}`,
          `  ${edu.institution}`,
          `  ${edu.startDate} - ${edu.current ? "Present" : edu.endDate}`,
          `  ${edu.grade}`,
        ].join("\n");
        setOutput(output);
      },
      keywords: ["degree", "university", "college", "cgpa"],
    },
    {
      name: "work",
      description: "View work experience",
      action: () => {
        const lines = ["💼 WORK EXPERIENCE", "─".repeat(50)];
        experienceData.work.forEach((job, idx) => {
          const endDate = job.current ? "Present" : job.endDate;
          lines.push(`\n  [${idx + 1}] ${job.role}`);
          lines.push(`      ${job.company} • ${job.location}`);
          lines.push(`      ${job.startDate} → ${endDate}`);
        });
        lines.push("\n  Type 'experience' to view full details →");
        setOutput(lines.join("\n"));
      },
      keywords: ["jobs", "internship", "career", "exp"],
    },
    {
      name: "research",
      description: "View published research",
      action: () => {
        const lines = ["📄 RESEARCH & PUBLICATIONS", "─".repeat(50)];
        siteData.research.forEach((paper, idx) => {
          lines.push(`\n  [${idx + 1}] "${paper.title}"`);
          lines.push(`      ${paper.publication}`);
          lines.push(`      DOI: ${paper.doi}`);
          lines.push(`      ${paper.description}`);
        });
        setOutput(lines.join("\n"));
      },
      keywords: ["papers", "publications", "academic"],
    },
    {
      name: "social",
      description: "Display social links",
      action: () => {
        const output = [
          "🔗 CONNECT WITH ME",
          "─".repeat(40),
          `  LinkedIn:  ${siteData.social.linkedin}`,
          `  GitHub:    ${siteData.social.github}`,
          `  Blog:      ${siteData.blog.url}`,
          `  Email:     ${siteData.email}`,
          "",
          "  Tip: Click links above or use 'contact' command",
        ].join("\n");
        setOutput(output);
      },
      keywords: ["links", "connect", "linkedin", "github"],
    },
    // ===== UNIX-LIKE COMMANDS =====
    {
      name: "ls",
      description: "List available sections",
      action: () => {
        const output = [
          "drwxr-xr-x  rogit  staff  home/",
          "drwxr-xr-x  rogit  staff  experience/",
          "drwxr-xr-x  rogit  staff  projects/",
          "drwxr-xr-x  rogit  staff  about/",
          "-rw-r--r--  rogit  staff  resume.pdf",
          "-rw-r--r--  rogit  staff  README.md",
        ].join("\n");
        setOutput(output);
      },
      keywords: ["list", "dir", "files"],
    },
    {
      name: "cat",
      description: "View file contents",
      action: () => {
        setOutput("Usage: cat <filename>\n  Try: cat resume.pdf, cat README.md");
      },
    },
    {
      name: "cat resume.pdf",
      description: "Open resume",
      action: () => {
        window.open(siteData.resume, "_blank");
        setOutput("📄 Opening resume.pdf in new tab...");
      },
    },
    {
      name: "cat README.md",
      description: "View README",
      action: () => {
        const readme = [
          "# " + siteData.name,
          "",
          siteData.bio.intro,
          "",
          "## Quick Links",
          "- Type `neofetch` for system info",
          "- Type `skills` to see my tech stack", 
          "- Type `work` for experience",
          "- Type `projects` to explore my work",
        ].join("\n");
        setOutput(readme);
      },
    },
    {
      name: "pwd",
      description: "Print working directory",
      action: () => {
        setOutput("/home/guest/rogit-portfolio");
      },
    },
    {
      name: "date",
      description: "Show current date/time",
      action: () => {
        setOutput(new Date().toString());
      },
      keywords: ["time", "now"],
    },
    {
      name: "echo",
      description: "Echo text back",
      action: () => {
        setOutput("Usage: echo <text>");
      },
    },
    {
      name: "history",
      description: "Show command history",
      action: () => {
        if (history.length === 0) {
          setOutput("No commands in history yet.");
          return;
        }
        const lines = history.map((h, i) => `  ${(i + 1).toString().padStart(3)}  ${h.input}`);
        setOutput(lines.join("\n"));
      },
    },
    // ===== EASTER EGGS =====
    {
      name: "fortune",
      description: "Get your fortune",
      action: () => {
        const fortunes = [
          "You will mass mass produce mass-produced code.",
          "A segfault in production will teach you more than 100 tutorials.",
          "The debugger sees all. The debugger knows all.",
          "git push --force is in your future... unfortunately.",
          "You will find the missing semicolon. Eventually.",
          "Today is a good day to refactor that code you wrote 3 months ago.",
          "The coffee machine and the code editor are your best friends.",
        ];
        setOutput(`🔮 ${fortunes[Math.floor(Math.random() * fortunes.length)]}`);
      },
      keywords: ["luck", "predict"],
    },
    {
      name: "cowsay",
      description: "Cow says...",
      action: () => {
        const messages = ["Moo!", "Hire Rogit!", "I'm a cow, not a debugger", "TypeScript > JavaScript"];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const cow = [
          ` ${"_".repeat(msg.length + 2)}`,
          `< ${msg} >`,
          ` ${"-".repeat(msg.length + 2)}`,
          "        \\   ^__^",
          "         \\  (oo)\\_______",
          "            (__)\\       )\\/\\",
          "                ||----w |",
          "                ||     ||",
        ].join("\n");
        setOutput(cow);
      },
    },
    {
      name: "rm -rf /",
      description: "Delete everything",
      action: () => {
        setOutput("Nice try. 🙃\n\nrm: cannot remove '/': Permission denied\n(This is a portfolio, not a real filesystem)");
      },
      keywords: ["delete", "remove"],
    },
    {
      name: "vim",
      description: "Open vim",
      action: () => {
        setOutput("You have entered vim.\n\n...Good luck getting out.\n\nHint: ESC :q! Enter (or just close this terminal)");
      },
      keywords: ["vi", "editor"],
    },
    {
      name: "exit",
      description: "Close terminal",
      action: () => {
        setOutput("Goodbye! 👋");
        setTimeout(() => setIsOpen(false), 500);
      },
      keywords: ["quit", "close", "bye"],
    },
    {
      name: "hack",
      description: "🔓",
      action: () => {
        const hackOutput = [
          "[*] Initializing hack sequence...",
          "[*] Bypassing firewall... SUCCESS",
          "[*] Accessing mainframe... SUCCESS", 
          "[*] Downloading secrets... 100%",
          "[!] ALERT: Intrusion detected!",
          "[*] Covering tracks...",
          "",
          "Just kidding. This is a portfolio. 😄",
          "But nice hacker spirit! Maybe try 'matrix' instead.",
        ];
        setOutput(hackOutput.join("\n"));
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

    // Exact match first
    for (const cmd of commands) {
      if (cmd.name.toLowerCase() === trimmed) return cmd;
    }

    // Keyword match
    for (const cmd of commands) {
      if (cmd.keywords?.some((kw) => kw === trimmed)) return cmd;
    }

    return null;
  };

  // Handle dynamic commands with arguments
  const handleDynamicCommand = (inputStr: string): string | null => {
    const trimmed = inputStr.trim();
    
    // echo <text>
    if (trimmed.toLowerCase().startsWith("echo ")) {
      const text = trimmed.slice(5);
      return text || "(empty)";
    }
    
    // open <url>
    if (trimmed.toLowerCase().startsWith("open ")) {
      const url = trimmed.slice(5);
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.open(url, "_blank");
        return `Opening ${url}...`;
      }
      return `Invalid URL. Usage: open https://example.com`;
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

    let outputText: string | undefined;
    
    // Try static command first
    const cmd = findCommand(trimmed);
    
    if (cmd) {
      // Execute command - it may return a string, void, or Promise
      const result = cmd.action();
      
      // Only capture output if the command explicitly returns a string
      if (typeof result === "string") {
        outputText = result;
      }
      // If void/undefined, the command handles its own output via setOutput()
    } else {
      // Try dynamic command
      const dynamicResult = handleDynamicCommand(trimmed);
      if (dynamicResult !== null) {
        outputText = dynamicResult;
      } else {
        outputText = `Command not found: ${trimmed}. Type 'help' for available commands.`;
      }
    }

    const newHistoryItem: TerminalHistoryItem = {
      input: trimmed,
      output: outputText,
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
        <FaTerminal className="w-5 h-5" />
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
                    <FaTimes className="w-4 h-4" />
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
