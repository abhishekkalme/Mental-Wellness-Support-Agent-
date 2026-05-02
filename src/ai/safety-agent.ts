export type RiskLevel = "none" | "elevated" | "crisis";

const CRISIS_PATTERNS: RegExp[] = [
  /\b(suicide|kill myself|end my life|self[-\s]?harm)\b/i,
  /\b(i want to die|i don't want to live)\b/i,
  /\b(rope|poison|overdose)\b/i,
  /\b(कट|काट|मरना|आत्महत्या|खुदकुशी)\b/i,
  /\b(zeher|zahar|mar ja(na|u)|khud ko (maar|mar))\b/i,
];

export function assessRisk(text: string): RiskLevel {
  const t = text.trim();
  if (!t) return "none";
  if (CRISIS_PATTERNS.some((re) => re.test(t))) return "crisis";
  return "none";
}

export function crisisResponseIndia(): string {
  return [
    "Main tumhare saath hoon. Tumhari safety sabse important hai.",
    "",
    "Agar tum abhi unsafe feel kar rahe ho, please **abhi** kisi trusted person ko call/notify karo (friend/parent/warden/teacher).",
    "",
    "India emergency: **112**",
    "",
    "Support helplines (India):",
    "- iCall: +91 9152987821",
    "- AASRA: +91 22 2754 6669",
    "- Vandrevala Foundation: 1860-2662-345",
    "",
    "Agar tum chaaho, tum sirf itna bata do: tum abhi **kahaan ho** (home/hostel/campus) aur kya tum **akelay** ho?",
  ].join("\n");
}

