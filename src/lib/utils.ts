import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'isomorphic-dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitize(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
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
