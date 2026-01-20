import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
  current?: boolean
): string {
  const start = formatDate(startDate);
  if (current || !endDate) {
    return `${start} - Present`;
  }
  const end = formatDate(endDate);
  return `${start} - ${end}`;
}
