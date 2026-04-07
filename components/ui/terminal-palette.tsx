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
    ____             _ __  
   / __ \\____  ____ (_) /_ 
  / /_/ / __ \\/ __ \\/ / __/
 / _, _/ /_/ / /_/ / / /_  
/_/ |_|\\____/\\__, /_/\\__/  
            /____/         
`.trim();

// Box drawing helpers
const BOX = {
  tl: "╭", tr: "╮", bl: "╰", br: "╯",
  h: "─", v: "│",
  lt: "├", rt: "┤",
} as const;

const boxLine = (width: number) => BOX.h.repeat(width);
const boxTop = (title: string, width: number) => {
  const padding = width - title.length - 4;
  return `${BOX.tl}${BOX.h} ${title} ${BOX.h.repeat(Math.max(0, padding))}${BOX.tr}`;
};
const boxMid = (width: number) => `${BOX.lt}${boxLine(width)}${BOX.rt}`;
const boxBot = (width: number) => `${BOX.bl}${boxLine(width)}${BOX.br}`;
const boxRow = (text: string, width: number) => {
  const padding = width - text.length - 2;
  return `${BOX.v} ${text}${" ".repeat(Math.max(0, padding))}${BOX.v}`;
};

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
  const scrollRef = useRef<HTMLDivElement>(null);
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
      description: "Toggle theme",
      action: () => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
        return "\n  🎨 Theme toggled!\n";
      },
      keywords: ["dark", "light", "mode"],
    },
    {
      name: "random",
      description: "Random fun fact",
      action: () => {
        const facts = [
          "I once debugged for 6 hours before realizing I was on the wrong branch 🤦",
          "My first program was 'Hello World' in Python... and it still works!",
          "I prefer spaces over tabs. Yes, this is the hill I'll die on.",
          "I've accidentally deployed to production twice... this year.",
          "I break for coffee. And by break, I mean the code breaks without it.",
          "My git commit messages get progressively less descriptive after midnight.",
          "I once fixed a bug by adding a comment. Don't ask.",
        ];
        return `\n  💡 ${facts[Math.floor(Math.random() * facts.length)]}\n`;
      },
      keywords: ["fact", "fun"],
    },
    {
      name: "matrix",
      description: "Enter the Matrix",
      action: () => {
        setIsMatrixActive(true);
        setTimeout(() => setIsMatrixActive(false), 5000);
        return "\n  🟢 Matrix activated... follow the white rabbit.\n";
      },
      keywords: ["green", "code", "neo"],
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
        const categories = {
          "Navigation": ["home", "experience", "projects", "about", "contact"],
          "Info": ["whoami", "neofetch", "skills", "education", "work", "research", "social"],
          "Unix": ["ls", "cat", "pwd", "date", "echo", "history", "clear"],
          "Fun": ["theme", "random", "matrix", "fortune", "cowsay", "hack"],
        };
        
        const lines = ["", boxTop("AVAILABLE COMMANDS", 50)];
        
        Object.entries(categories).forEach(([category, cmdNames]) => {
          lines.push(boxRow(`[${category}]`, 50));
          const cmds = commands.filter(c => cmdNames.includes(c.name));
          cmds.forEach(c => {
            lines.push(boxRow(`  ${c.name.padEnd(14)} ${c.description}`, 50));
          });
        });
        
        lines.push(boxBot(50));
        lines.push("");
        lines.push("  💡 Tip: Use Tab for autocomplete, ↑↓ for history");
        return lines.join("\n");
      },
      keywords: ["commands", "list"],
    },
    {
      name: "sudo make-coffee",
      description: "Make coffee",
      action: () => {
        return [
          "",
          "  ☕ Brewing coffee...",
          "",
          "  [▓▓▓▓▓▓▓▓▓▓] Grinding beans... DONE",
          "  [▓▓▓▓▓▓▓▓▓▓] Heating water.... DONE",
          "  [▓▓▓▓▓▓▓▓▓▓] Brewing.......... ERROR",
          "",
          "  ❌ Error: coffee machine not found",
          "  You'll have to make it yourself. Sorry!",
          "",
        ].join("\n");
      },
    },
    {
      name: "sudo make-sandwich",
      description: "Make sandwich",
      action: () => {
        return [
          "",
          "  🥪 Making sandwich...",
          "",
          "  ❌ Error: Sandwich making is a privileged operation.",
          "",
          "  Suggestion: sudo make-me-a-sandwich",
          "  Response: Okay.",
          "",
          "  Just kidding. Make it yourself. 🙂",
          "",
        ].join("\n");
      },
    },
    // ===== DATA COMMANDS =====
    {
      name: "whoami",
      description: "Display user identity",
      action: () => {
        const w = 44;
        return [
          "",
          ASCII_LOGO,
          "",
          boxTop("IDENTITY", w),
          boxRow(`Name      ${siteData.name}`, w),
          boxRow(`Title     ${siteData.title}`, w),
          boxRow(`Location  ${siteData.location}`, w),
          boxRow(`Email     ${siteData.email}`, w),
          boxBot(w),
          "",
          `  "${siteData.bio.short}"`,
          "",
        ].join("\n");
      },
      keywords: ["me", "identity", "user"],
    },
    {
      name: "neofetch",
      description: "System info (portfolio style)",
      action: () => {
        const workCount = experienceData.work.length;
        const skillCount = siteData.skills.languages.length + siteData.skills.tools.length;
        const researchCount = siteData.research.length;
        
        const artLines = ASCII_LOGO.split("\n");
        const info = [
          `\x1b[1mguest\x1b[0m@\x1b[1mrogit.me\x1b[0m`,
          `──────────────────────────`,
          `OS        Portfolio v2.0`,
          `Host      ${siteData.institution.split(",")[0]}`,
          `Kernel    Next.js 16 + TypeScript`,
          `Uptime    ${new Date().getFullYear() - 2022} years in college`,
          `Packages  ${skillCount} skills`,
          `Shell     zsh (terminal-palette)`,
          `Terminal  rogit.me`,
          `CPU       ${siteData.name}`,
          `Memory    ${workCount} internships • ${researchCount} papers`,
          ``,
          `Languages ${siteData.skills.languages.join(", ")}`,
          `Focus     ${siteData.tagline.join(" • ")}`,
        ];
        
        const maxLines = Math.max(artLines.length, info.length);
        const combined = [""];
        for (let i = 0; i < maxLines; i++) {
          const art = (artLines[i] || "").padEnd(28);
          const inf = info[i] || "";
          combined.push(`  ${art}${inf}`);
        }
        combined.push("");
        return combined.join("\n");
      },
      keywords: ["fetch", "sysinfo", "system"],
    },
    {
      name: "skills",
      description: "List technical skills",
      action: () => {
        const { languages, tools, interests, soft } = siteData.skills;
        const w = 52;
        return [
          "",
          boxTop("TECHNICAL SKILLS", w),
          boxRow("", w),
          boxRow("◈ Languages", w),
          boxRow(`    ${languages.join("  •  ")}`, w),
          boxRow("", w),
          boxRow("◈ Tools & Frameworks", w),
          boxRow(`    ${tools.slice(0, 5).join(", ")}`, w),
          boxRow(`    ${tools.slice(5).join(", ")}`, w),
          boxRow("", w),
          boxRow("◈ Domains", w),
          boxRow(`    ${interests.slice(0, 3).join(", ")}`, w),
          boxRow(`    ${interests.slice(3, 6).join(", ")}`, w),
          boxRow(`    ${interests.slice(6).join(", ")}`, w),
          boxRow("", w),
          boxRow("◈ Soft Skills", w),
          boxRow(`    ${soft.slice(0, 3).join(", ")}`, w),
          boxRow(`    ${soft.slice(3).join(", ")}`, w),
          boxBot(w),
          "",
        ].join("\n");
      },
      keywords: ["tech", "stack", "technologies"],
    },
    {
      name: "education",
      description: "View education",
      action: () => {
        const edu = experienceData.education[0];
        const w = 54;
        return [
          "",
          boxTop("🎓 EDUCATION", w),
          boxRow("", w),
          boxRow(`${edu.degree}`, w),
          boxRow(`in ${edu.field}`, w),
          boxRow("", w),
          boxRow(`📍 ${edu.institution}`, w),
          boxRow(`📅 ${edu.startDate} - ${edu.current ? "Present (Final Year)" : edu.endDate}`, w),
          boxRow(`📊 ${edu.grade}`, w),
          boxRow("", w),
          boxBot(w),
          "",
        ].join("\n");
      },
      keywords: ["degree", "university", "college", "cgpa"],
    },
    {
      name: "work",
      description: "View work experience",
      action: () => {
        const w = 58;
        const lines = ["", boxTop("💼 WORK EXPERIENCE", w), boxRow("", w)];
        
        experienceData.work.forEach((job, idx) => {
          const endDate = job.current ? "Present" : job.endDate;
          const duration = `${job.startDate} → ${endDate}`;
          lines.push(boxRow(`[${idx + 1}] ${job.role}`, w));
          lines.push(boxRow(`    @ ${job.company}`, w));
          lines.push(boxRow(`    📍 ${job.location}  •  📅 ${duration}`, w));
          if (idx < experienceData.work.length - 1) {
            lines.push(boxRow("", w));
          }
        });
        
        lines.push(boxRow("", w));
        lines.push(boxBot(w));
        lines.push("");
        lines.push("  → Type 'experience' to view full details with achievements");
        lines.push("");
        return lines.join("\n");
      },
      keywords: ["jobs", "internship", "career", "exp"],
    },
    {
      name: "research",
      description: "View publications",
      action: () => {
        const w = 62;
        const lines = ["", boxTop("📄 RESEARCH & PUBLICATIONS", w), boxRow("", w)];
        
        siteData.research.forEach((paper, idx) => {
          lines.push(boxRow(`[${idx + 1}] ${paper.title.slice(0, 50)}...`, w));
          lines.push(boxRow(`    📰 ${paper.publication}`, w));
          lines.push(boxRow(`    🔗 DOI: ${paper.doi}`, w));
          lines.push(boxRow("", w));
        });
        
        lines.push(boxBot(w));
        lines.push("");
        return lines.join("\n");
      },
      keywords: ["papers", "publications", "academic"],
    },
    {
      name: "social",
      description: "Social links",
      action: () => {
        const w = 52;
        return [
          "",
          boxTop("🔗 CONNECT", w),
          boxRow("", w),
          boxRow(`LinkedIn   ${siteData.social.linkedin.replace("https://www.", "")}`, w),
          boxRow(`GitHub     ${siteData.social.github.replace("https://", "")}`, w),
          boxRow(`Blog       ${siteData.blog.url.replace("https://", "")}`, w),
          boxRow(`Email      ${siteData.email}`, w),
          boxRow("", w),
          boxBot(w),
          "",
          "  💡 Use 'contact' to open email client",
          "",
        ].join("\n");
      },
      keywords: ["links", "connect", "linkedin", "github"],
    },
    // ===== UNIX-LIKE COMMANDS =====
    {
      name: "ls",
      description: "List sections",
      action: () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
        return [
          "",
          `total 6`,
          `drwxr-xr-x  rogit  staff  ${dateStr}  \x1b[34mhome/\x1b[0m`,
          `drwxr-xr-x  rogit  staff  ${dateStr}  \x1b[34mexperience/\x1b[0m`,
          `drwxr-xr-x  rogit  staff  ${dateStr}  \x1b[34mprojects/\x1b[0m`,
          `drwxr-xr-x  rogit  staff  ${dateStr}  \x1b[34mabout/\x1b[0m`,
          `-rw-r--r--  rogit  staff  ${dateStr}  resume.pdf`,
          `-rw-r--r--  rogit  staff  ${dateStr}  README.md`,
          "",
        ].join("\n");
      },
      keywords: ["list", "dir", "files"],
    },
    {
      name: "cat",
      description: "View file contents",
      action: () => {
        return "\n  Usage: cat <filename>\n\n  Available files:\n    • resume.pdf    - Open resume\n    • README.md     - About this portfolio\n";
      },
    },
    {
      name: "cat resume.pdf",
      description: "Open resume",
      action: () => {
        window.open(siteData.resume, "_blank");
        return "\n  📄 Opening resume.pdf in new tab...\n";
      },
    },
    {
      name: "cat README.md",
      description: "View README",
      action: () => {
        return [
          "",
          "  ┌──────────────────────────────────────┐",
          "  │  # " + siteData.name.padEnd(34) + "│",
          "  └──────────────────────────────────────┘",
          "",
          "  " + siteData.bio.intro,
          "",
          "  ## Quick Commands",
          "  ─────────────────",
          "    neofetch     System info with ASCII art",
          "    skills       Technical skills breakdown",
          "    work         Work experience timeline",
          "    projects     Navigate to projects page",
          "",
        ].join("\n");
      },
    },
    {
      name: "pwd",
      description: "Print working directory",
      action: () => {
        return "\n  /home/guest/rogit-portfolio\n";
      },
    },
    {
      name: "date",
      description: "Current date/time",
      action: () => {
        const now = new Date();
        return `\n  ${now.toLocaleString("en-US", { 
          weekday: "long", 
          year: "numeric", 
          month: "long", 
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short"
        })}\n`;
      },
      keywords: ["time", "now"],
    },
    {
      name: "echo",
      description: "Echo text",
      action: () => {
        return "\n  Usage: echo <message>\n";
      },
    },
    {
      name: "history",
      description: "Command history",
      action: () => {
        if (history.length === 0) {
          return "\n  No commands in history yet.\n";
        }
        const lines = ["\n"];
        history.forEach((h, i) => {
          lines.push(`  ${(i + 1).toString().padStart(4)}  ${h.input}`);
        });
        lines.push("");
        return lines.join("\n");
      },
    },
    // ===== EASTER EGGS =====
    {
      name: "fortune",
      description: "Get your fortune",
      action: () => {
        const fortunes = [
          "You will mass produce mass-produced code. And it'll work.",
          "A segfault in production teaches more than 100 tutorials.",
          "The debugger sees all. The debugger knows all. Trust the debugger.",
          "git push --force is in your future... choose wisely.",
          "You will find the missing semicolon. Eventually. Maybe.",
          "Today is a good day to refactor that code from 3 months ago.",
          "Coffee → Code → Debug → Repeat. This is the way.",
          "Your next PR will be approved on the first review. Just kidding.",
          "The bug you're hunting is on line 42. It's always line 42.",
        ];
        return `\n  🔮 ${fortunes[Math.floor(Math.random() * fortunes.length)]}\n`;
      },
      keywords: ["luck", "predict"],
    },
    {
      name: "cowsay",
      description: "Wise cow speaks",
      action: () => {
        const messages = [
          "Hire Rogit!",
          "Moo-ve fast, break things",
          "I'm not a debugger, I'm a cow",
          "TypeScript > JavaScript. Fight me.",
          "Have you tried turning it off and on?",
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const border = "_".repeat(msg.length + 2);
        const borderBot = "-".repeat(msg.length + 2);
        return [
          "",
          `   ${border}`,
          `  < ${msg} >`,
          `   ${borderBot}`,
          "          \\   ^__^",
          "           \\  (oo)\\_______",
          "              (__)\\       )\\/\\",
          "                  ||----w |",
          "                  ||     ||",
          "",
        ].join("\n");
      },
    },
    {
      name: "rm -rf /",
      description: "Delete everything",
      action: () => {
        return [
          "",
          "  ⚠️  PERMISSION DENIED",
          "",
          "  rm: cannot remove '/': Operation not permitted",
          "  (Nice try though. This is a portfolio, not a real filesystem)",
          "",
          "  💡 Try 'hack' or 'matrix' instead for fun effects",
          "",
        ].join("\n");
      },
      keywords: ["delete", "remove"],
    },
    {
      name: "vim",
      description: "Open vim",
      action: () => {
        return [
          "",
          "  Welcome to VIM - Vi IMproved",
          "  ─────────────────────────────",
          "",
          "  You have entered vim.",
          "  ...Good luck getting out.",
          "",
          "  [Normal mode]",
          "",
          "  Hint: ESC :q! Enter",
          "  Or just close this terminal. We won't judge.",
          "",
        ].join("\n");
      },
      keywords: ["vi", "editor"],
    },
    {
      name: "exit",
      description: "Close terminal",
      action: () => {
        setTimeout(() => setIsOpen(false), 800);
        return "\n  👋 Goodbye! Come back soon.\n\n  Closing terminal...\n";
      },
      keywords: ["quit", "close", "bye"],
    },
    {
      name: "hack",
      description: "🔓 Hack the mainframe",
      action: () => {
        return [
          "",
          "  [▓▓▓▓▓▓▓▓▓▓] Initializing hack sequence...",
          "  [▓▓▓▓▓▓▓▓▓▓] Bypassing firewall........... SUCCESS",
          "  [▓▓▓▓▓▓▓▓▓▓] Accessing mainframe.......... SUCCESS",
          "  [▓▓▓▓▓▓▓▓▓▓] Downloading secrets.......... 100%",
          "  [██████████] ALERT: Intrusion detected!",
          "  [▓▓▓▓▓▓▓▓▓▓] Covering tracks.............. SUCCESS",
          "",
          "  Just kidding. This is a portfolio. 😄",
          "  But nice hacker spirit! Try 'matrix' for the full effect.",
          "",
        ].join("\n");
      },
    },
    {
      name: "sudo",
      description: "Superuser do",
      action: () => {
        const responses = [
          "You're not root. Nice try though 🤨",
          "Permission denied. But A for effort!",
          "sudo: user 'guest' is not in the sudoers file. This incident will be reported.",
          "🚫 Access denied. Have you tried asking nicely?",
          "Error: This isn't a real terminal. But you knew that.",
        ];
        return `\n  ${responses[Math.floor(Math.random() * responses.length)]}\n`;
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

              <div ref={scrollRef} className="flex-1 overflow-auto p-4 font-mono text-sm bg-background/50">
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
                    <div className="text-muted-foreground pl-4 whitespace-pre-wrap">
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
  const [columns, setColumns] = useState<Array<{ chars: string[]; speed: number; y: number }>>([]);

  useEffect(() => {
    const charSet = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*";
    const colWidth = 18;
    const colCount = Math.ceil(window.innerWidth / colWidth);
    const rowCount = Math.ceil(window.innerHeight / 20) + 10; // Extra rows for smooth scrolling

    const initialColumns = Array.from({ length: colCount }, () => ({
      chars: Array.from({ length: rowCount }, () => charSet[Math.floor(Math.random() * charSet.length)]),
      speed: 0.5 + Math.random() * 1.5,
      y: -Math.random() * rowCount * 20, // Start at different positions
    }));

    setColumns(initialColumns);

    const interval = setInterval(() => {
      setColumns((prev) =>
        prev.map((col) => {
          const newChars = [...col.chars];
          // Shift characters down
          for (let i = newChars.length - 1; i > 0; i--) {
            newChars[i] = newChars[i - 1];
          }
          newChars[0] = charSet[Math.floor(Math.random() * charSet.length)];
          return { ...col, chars: newChars };
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black pointer-events-none overflow-hidden">
      <div className="flex w-full h-full">
        {columns.map((col, idx) => (
          <div 
            key={idx} 
            className="flex flex-col font-mono leading-tight"
            style={{ 
              width: '18px',
              fontSize: '14px',
            }}
          >
            {col.chars.map((char, charIdx) => (
              <span
                key={charIdx}
                style={{
                  color: charIdx === 0 
                    ? '#90EE90' 
                    : charIdx < 3 
                      ? '#00FF00' 
                      : `rgba(0, 255, 0, ${Math.max(0.1, 1 - charIdx * 0.05)})`,
                  textShadow: charIdx === 0 ? '0 0 8px #00FF00' : 'none',
                  fontWeight: charIdx === 0 ? 'bold' : 'normal',
                }}
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
