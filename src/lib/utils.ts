import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Base styles applied to components
 */
export const componentBaseStyles = [
  // Default 11px font size applied inside components only
  "text-[11px]",
];

/**
 * Minimal `cn` helper that only merges class names
 */
export function cnPure(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Enhanced `cn` helper that injects base component styles.
 * Places `componentBaseStyles` before user-supplied classes so users can override defaults.
 */
export function cn(...inputs: ClassValue[]) {
  // Put base styles first so user classes passed in can override them via tailwind-merge
  return twMerge(clsx(...componentBaseStyles, ...inputs));
}
