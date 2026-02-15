import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({
  children,
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-[90%] max-w-5xl px-2",
        className
      )}
    >
      {children}
    </div>
  );
}
