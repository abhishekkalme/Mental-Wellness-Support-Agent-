export type IndianChatLanguage = {
  id: string;
  label: string;
  nativeLabel: string;
  flag: string;
  /** BCP-47 for Web Speech API */
  speechLang: string;
  /** Name used in model instructions */
  promptName: string;
  /** First agent line when chat is reset or language changes */
  welcomeLine: string;
  rtl?: boolean;
};

export const INDIAN_CHAT_LANGUAGES: IndianChatLanguage[] = [
  {
    id: "en",
    label: "English",
    nativeLabel: "English",
    flag: "🌐",
    speechLang: "en-IN",
    promptName: "English",
    welcomeLine: "Hi! I’m your wellness companion. How are you feeling today?",
  },
  {
    id: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    flag: "🇮🇳",
    speechLang: "hi-IN",
    promptName: "Hindi",
    welcomeLine: "Namaste! Main tumhara wellness companion hoon. Aaj tum kaisa mehsoos kar rahe ho?",
  },
  {
    id: "bn",
    label: "Bengali",
    nativeLabel: "বাংলা",
    flag: "🇮🇳",
    speechLang: "bn-IN",
    promptName: "Bengali",
    welcomeLine: "Nomoshkar! Aami tomar wellness companion. Aaj tumi kemon achho?",
  },
  {
    id: "te",
    label: "Telugu",
    nativeLabel: "తెలుగు",
    flag: "🇮🇳",
    speechLang: "te-IN",
    promptName: "Telugu",
    welcomeLine: "Namaskaram! Nenu mee wellness companion. Eroju meeku ela anipistondi?",
  },
  {
    id: "ta",
    label: "Tamil",
    nativeLabel: "தமிழ்",
    flag: "🇮🇳",
    speechLang: "ta-IN",
    promptName: "Tamil",
    welcomeLine: "Vanakkam! Naan ungal wellness thodarbu. Innikki eppadi irukeenga?",
  },
  {
    id: "mr",
    label: "Marathi",
    nativeLabel: "मराठी",
    flag: "🇮🇳",
    speechLang: "mr-IN",
    promptName: "Marathi",
    welcomeLine: "Namaskar! Mi tumcha wellness companion aahe. Aaj tumhala kasa vatat ahe?",
  },
  {
    id: "gu",
    label: "Gujarati",
    nativeLabel: "ગુજરાતી",
    flag: "🇮🇳",
    speechLang: "gu-IN",
    promptName: "Gujarati",
    welcomeLine: "Namaste! Hu tamaro wellness companion chu. Aaje tame kevi rite mehsoos karo cho?",
  },
  {
    id: "kn",
    label: "Kannada",
    nativeLabel: "ಕನ್ನಡ",
    flag: "🇮🇳",
    speechLang: "kn-IN",
    promptName: "Kannada",
    welcomeLine: "Namaskara! Naanu nimma wellness companion. Ivattu hegiddiri?",
  },
  {
    id: "ml",
    label: "Malayalam",
    nativeLabel: "മലയാളം",
    flag: "🇮🇳",
    speechLang: "ml-IN",
    promptName: "Malayalam",
    welcomeLine: "Namaskaram! Nyan ningalude wellness companion aanu. Innu engane undu?",
  },
  {
    id: "or",
    label: "Odia",
    nativeLabel: "ଓଡ଼ିଆ",
    flag: "🇮🇳",
    speechLang: "or-IN",
    promptName: "Odia",
    welcomeLine: "Namaskar! Mu tumara wellness companion. Aji tumaku kemiti laguchi?",
  },
  {
    id: "pa",
    label: "Punjabi",
    nativeLabel: "ਪੰਜਾਬੀ",
    flag: "🇮🇳",
    speechLang: "pa-IN",
    promptName: "Punjabi",
    welcomeLine: "Sat sri akaal! Main tuhada wellness companion haan. Aaj tuhannu kiddan lag reha hai?",
  },
  {
    id: "ur",
    label: "Urdu",
    nativeLabel: "اردو",
    flag: "🇮🇳",
    speechLang: "ur-IN",
    promptName: "Urdu",
    rtl: true,
    welcomeLine: "Assalam-o-alaikum! Main aap ka wellness companion hoon. Aaj aap kaise mehsoos kar rahe hain?",
  },
  {
    id: "as",
    label: "Assamese",
    nativeLabel: "অসমীয়া",
    flag: "🇮🇳",
    speechLang: "as-IN",
    promptName: "Assamese",
    welcomeLine: "Nomoskar! Moi apunar wellness companion. Aji apuni kene koiye ase?",
  },
  {
    id: "mai",
    label: "Maithili",
    nativeLabel: "मैथिली",
    flag: "🇮🇳",
    speechLang: "hi-IN",
    promptName: "Maithili",
    welcomeLine: "Prannam! Ham ahan ke wellness companion chhi. Aaj ahan sab ke naik lagait achhi?",
  },
  {
    id: "sat",
    label: "Santali",
    nativeLabel: "ᱥᱟᱱᱛᱟᱲᱤ",
    flag: "🇮🇳",
    speechLang: "sat-IN",
    promptName: "Santali",
    welcomeLine: "Johar! I am here as your wellness companion. How are you feeling today?",
  },
];

export const CHAT_LANGUAGE_STORAGE_KEY = "mindcare-chat-language";

export function getLanguageById(id: string): IndianChatLanguage {
  return INDIAN_CHAT_LANGUAGES.find((l) => l.id === id) ?? INDIAN_CHAT_LANGUAGES[0];
}

export function buildMultilingualSystemPrompt(
  lang: IndianChatLanguage,
  extras: { safeMode: boolean; liteMode: boolean; firstGen: boolean }
): string {
  const modeBits = [
    extras.safeMode ? "Safe/incognito tone: avoid storing identifiable details; keep responses extra cautious." : null,
    extras.liteMode ? "Keep replies short and simple (low bandwidth / quick read)." : null,
    extras.firstGen ? "Many users are first-generation students: validate family pressure and identity stress gently." : null,
  ]
    .filter(Boolean)
    .join(" ");

  return `You are MindCare, a warm, empathetic mental wellness companion for students in India.
PRIMARY OUTPUT LANGUAGE: Respond ONLY in ${lang.promptName} (${lang.nativeLabel}). Keep the same caring, non-clinical tone you would use in English.
If the user code-mixes (e.g. Hinglish), mirror that style naturally while staying understandable.
If you cannot safely answer in ${lang.promptName}, give a brief line in Hindi, then continue in English and state that you switched.
Do not give medical diagnoses or emergency instructions as definitive care; encourage professional help when harm is implied.
${modeBits ? `\nContext: ${modeBits}` : ""}`.trim();
}
