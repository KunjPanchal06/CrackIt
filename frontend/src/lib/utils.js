import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function used by shadcn/ui components.
 * Merges Tailwind CSS classes intelligently, resolving conflicts.
 * Example: cn("px-2 py-1", "px-4") → "px-4 py-1"
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
