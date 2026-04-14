import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // decompose combined characters
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .trim()
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .replace(/[^\w-]+/g, '') // remove all non-word chars
        .replace(/--+/g, '-') // replace multiple hyphens with single hyphen
        .replace(/^-+/, '') // trim from start
        .replace(/-+$/, '') // trim from end
}
