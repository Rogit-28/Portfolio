import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "accent";
}

export function Tag({ children, className, variant = "default" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
        "hover:backdrop-blur-sm",
        variant === "default" && "bg-muted/80 text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10",
        variant === "accent" && "bg-accent/10 text-accent hover:bg-accent/20",
        className
      )}
    >
      {children}
    </span>
  );
}
