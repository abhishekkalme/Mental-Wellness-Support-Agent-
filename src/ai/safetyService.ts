export const crisisKeywords = [
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'better off dead',
  'cutting myself',
  'self harm',
  'overdose',
];

export function detectCrisis(text: string): boolean {
  const lowerText = text.toLowerCase();
  for (const keyword of crisisKeywords) {
    if (lowerText.includes(keyword)) {
      return true;
    }
  }
  return false;
}

export function generateCrisisResponse(): string {
  return "CRITICAL_SAFETY_TRIGGER: It sounds like you are going through a very difficult time. Please know you don't have to go through this alone. I am an AI, but immediate human support is available. Please reach out to the Crisis Lifeline by calling or texting 988, or text HOME to 741741 to connect with a crisis counselor 24/7. Your life is valuable.";
}
