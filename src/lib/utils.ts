import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strips all HTML tags and basic entities for safe AI processing.
 * Replaces isomorphic-dompurify which causes ESM/jsdom issues in production.
 */
export function sanitize(dirty: string): string {
  if (!dirty) return '';

  // Basic HTML tag removal
  let clean = dirty.replace(/<[^>]*>?/gm, '');

  // Basic entity decoding (optional but helpful for AI)
  clean = clean
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return clean;
}

export function sanitizeAndTrim(dirty: string): string {
  return sanitize(dirty).trim();
}

export function moderateContent(text: string): { safe: boolean; reason?: string } {
  const blocked = [
    'kill myself',
    'end my life',
    'suicide',
    'want to die',
    'better off dead',
    'cutting myself',
    'self harm',
    'overdose',
    "i'll hurt",
    'i will hurt',
    'kill you',
    'hurt you',
  ];
  const lower = text.toLowerCase();
  for (const phrase of blocked) {
    if (lower.includes(phrase)) {
      return { safe: false, reason: 'Content flagged for safety review.' };
    }
  }
  if (text.length > 10000) {
    return { safe: false, reason: 'Content exceeds maximum length.' };
  }
  return { safe: true };
}
