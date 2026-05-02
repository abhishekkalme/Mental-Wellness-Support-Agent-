"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  Settings,
  Zap,
  Sparkles,
  BookOpen,
  ChevronDown,
  Mic,
  Volume2,
  VolumeX,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CHAT_LANGUAGE_STORAGE_KEY,
  getLanguageById,
  INDIAN_CHAT_LANGUAGES,
  type IndianChatLanguage,
} from "@/lib/chat/indianLanguages";

type ChatMode = { safeMode: boolean; liteMode: boolean; ventOrganizeAct: boolean };
type ApiResponse = { risk: "none" | "elevated" | "crisis"; reply: string };
type ChatMessage = { id: string; role: "user" | "agent"; content: string };

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: { length: number; [i: number]: { 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-0.5 h-8 px-2" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-[#E2FF6F] block"
          animate={{
            height: active ? [6, 18, 10, 16, 6] : 6,
            opacity: active ? [0.6, 1, 0.7, 1, 0.6] : 0.35,
          }}
          transition={{
            duration: 0.9,
            repeat: active ? Infinity : 0,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function getInitialLanguageId(): string {
  if (typeof window === "undefined") return "hi";
  const saved = localStorage.getItem(CHAT_LANGUAGE_STORAGE_KEY);
  if (saved && INDIAN_CHAT_LANGUAGES.some((l) => l.id === saved)) return saved;
  return "hi";
}

export default function AgentChatPage() {
  const [langId, setLangId] = useState("hi");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const lang = useMemo(() => getLanguageById(langId), [langId]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "welcome", role: "agent", content: getLanguageById("hi").welcomeLine },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<ChatMode>({ safeMode: false, liteMode: false, ventOrganizeAct: true });
  const [firstGen, setFirstGen] = useState(false);
  const [consentMemory, setConsentMemory] = useState<"session" | "weekly">("session");

  const [speakReplies, setSpeakReplies] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  const [examStartDate, setExamStartDate] = useState("");
  const [examSubjects, setExamSubjects] = useState("Maths, Physics");
  const [examPlan, setExamPlan] = useState<string | null>(null);

  const [insightInputs, setInsightInputs] = useState({ bestMoment: "", worstMoment: "", oneImprovement: "" });
  const [insightCard, setInsightCard] = useState<string | null>(null);

  const [guiltAnswer, setGuiltAnswer] = useState("");
  const [guiltResult, setGuiltResult] = useState<{ state: string; steps: string[] } | null>(null);

  const [profType, setProfType] = useState<"extension" | "clarification" | "workload">("extension");
  const [profCourse, setProfCourse] = useState("CS101");
  const [profDeadline, setProfDeadline] = useState("Tomorrow 5pm");
  const [profScript, setProfScript] = useState<string | null>(null);

  useEffect(() => {
    const id = getInitialLanguageId();
    setLangId(id);
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === "welcome"
        ? [{ id: "welcome", role: "agent", content: getLanguageById(id).welcomeLine }]
        : prev
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_LANGUAGE_STORAGE_KEY, langId);
  }, [langId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    setSttSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!langMenuRef.current?.contains(e.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const pickVoice = useCallback(
    (speechLang: string) => {
      if (typeof window === "undefined") return null;
      const voices = window.speechSynthesis.getVoices();
      const [base] = speechLang.split("-");
      return (
        voices.find((v) => v.lang === speechLang) ||
        voices.find((v) => v.lang.startsWith(base + "-")) ||
        voices.find((v) => v.lang.startsWith(base)) ||
        null
      );
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => pickVoice(lang.speechLang);
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang.speechLang, pickVoice]);

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !text.trim()) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang.speechLang;
      const v = pickVoice(lang.speechLang);
      if (v) u.voice = v;
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    },
    [lang.speechLang, pickVoice]
  );

  const stopListening = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR || busy) return;

    stopListening();
    const rec = new SR();
    rec.lang = lang.speechLang;
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setInput(text.trimStart());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [busy, lang.speechLang, stopListening]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  const uiHints = useMemo(
    () =>
      [
        lang.label,
        mode.safeMode ? "Safe Mode" : null,
        mode.liteMode ? "Lite Mode" : null,
        firstGen ? "First-Gen Lens" : null,
        mode.ventOrganizeAct ? "Vent→Organize→Act" : null,
        consentMemory === "weekly" ? "Weekly Memory" : "Session Memory",
        speakReplies ? "Voice replies" : null,
      ].filter(Boolean) as string[],
    [mode, firstGen, consentMemory, lang.label, speakReplies]
  );

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    if (mode.safeMode && text.toLowerCase() === "exit") {
      setMessages((p) => [
        ...p,
        { id: Date.now().toString(), role: "user", content: text },
        {
          id: (Date.now() + 1).toString(),
          role: "agent",
          content: "Okay. Pausing for now. Jab ready ho, bas ‘hi’ type kar dena.",
        },
      ]);
      setInput("");
      return;
    }

    const nextMessages = [...messages, { id: Date.now().toString(), role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          chatLanguage: langId,
          mode,
          context: {
            firstGen,
            consentMemory,
            examWeek: {
              startDate: examStartDate || undefined,
              subjects: examSubjects.split(",").map((s) => s.trim()).filter(Boolean),
            },
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as ApiResponse | null;
      if (!res.ok || !data?.reply) throw new Error("API Exception");
      const reply = data.reply;
      setMessages((p) => [...p, { id: Date.now().toString(), role: "agent", content: reply }]);
      if (speakReplies) speakText(reply);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: Date.now().toString(),
          role: "agent",
          content: "Agent Core Disconnected. Please verify API conditions in Admin panel.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function resetThread() {
    stopListening();
    setMessages([{ id: "welcome", role: "agent", content: lang.welcomeLine }]);
  }

  function onLanguageSelect(next: IndianChatLanguage) {
    setLangId(next.id);
    setLangMenuOpen(false);
  }

  return (
    <div className="flex flex-col h-screen max-h-screen relative overflow-hidden bg-[#0A0D08]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E2FF6F]/3 blur-[100px] rounded-full" />
      </div>

      <header className="h-auto min-h-20 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-4 px-4 sm:px-8 py-3 glass-panel rounded-none z-50 shrink-0 bg-white/[0.02]">
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center border border-[#E2FF6F]/20 shrink-0">
              <Bot className="w-6 h-6 text-[#E2FF6F]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2 flex-wrap">
                Wellness Agent
                <span className="text-[10px] bg-[#E2FF6F] text-black px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                  Multilingual
                </span>
              </h1>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] truncate">
                Neural Connection · {lang.nativeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLangMenuOpen((o) => !o);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition-colors",
                  "bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-[#E2FF6F]/40",
                  lang.rtl && "flex-row-reverse"
                )}
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {lang.flag}
                </span>
                <Languages className="w-4 h-4 text-[#E2FF6F] shrink-0" />
                <span className="max-w-[120px] sm:max-w-[160px] truncate">
                  {lang.label}
                </span>
                <ChevronDown className={cn("w-4 h-4 opacity-60 transition-transform", langMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-[min(100vw-2rem,320px)] max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#0f120e] shadow-2xl z-50 py-1"
                    role="listbox"
                  >
                    {INDIAN_CHAT_LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        role="option"
                        aria-selected={l.id === langId}
                        onClick={() => onLanguageSelect(l)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors",
                          l.id === langId && "bg-[#E2FF6F]/15 text-[#E2FF6F]",
                          l.rtl && "flex-row-reverse text-right"
                        )}
                      >
                        <span className="text-lg">{l.flag}</span>
                        <span className="flex-1 min-w-0">
                          <span className="font-bold block truncate">{l.label}</span>
                          <span className="text-xs text-white/45 block truncate">{l.nativeLabel}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSpeakReplies((v) => !v)}
              className={cn(
                "rounded-2xl border-white/15 bg-white/5 gap-2",
                speakReplies && "border-[#E2FF6F]/50 bg-[#E2FF6F]/10 text-[#E2FF6F]"
              )}
              title={speakReplies ? "Turn off spoken replies" : "Read agent replies aloud"}
            >
              {speakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-60" />}
              <span className="hidden sm:inline text-xs font-bold">Voice</span>
            </Button>

            <Button
              onClick={resetThread}
              variant="outline"
              className="rounded-2xl bg-white/5 hover:bg-[#E2FF6F] hover:text-black border-white/10"
            >
              Reset Thread
            </Button>
          </div>
        </div>
      </header>

      <section className="flex-1 p-4 sm:p-8 relative z-10 grid gap-6 lg:grid-cols-12 overflow-hidden h-full min-h-0">
        <div
          className="flex flex-col rounded-[32px] border border-white/5 bg-white/5 shadow-2xl lg:col-span-8 overflow-hidden backdrop-blur-md min-h-0"
          dir={lang.rtl ? "rtl" : "ltr"}
        >
          <div className="border-b border-white/5 p-4 flex gap-2 overflow-x-auto custom-scroll flex-wrap">
            {uiHints.map((h) => (
              <span
                key={h}
                className="rounded-full border border-[#E2FF6F]/20 bg-[#E2FF6F]/10 px-3 py-1 text-xs text-[#E2FF6F] whitespace-nowrap font-medium tracking-wide"
              >
                {h}
              </span>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scroll min-h-0">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex max-w-[85%] gap-4",
                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500",
                      msg.role === "user"
                        ? "bg-white/5 border-white/10 text-white/40"
                        : "bg-[#E2FF6F]/10 border-[#E2FF6F]/20 text-[#E2FF6F]"
                    )}
                  >
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div
                    className={cn(
                      "px-6 py-4 rounded-[28px] text-[15px] font-medium leading-relaxed shadow-xl",
                      msg.role === "user"
                        ? "bg-[#E2FF6F] text-black rounded-tr-sm shadow-[#E2FF6F]/5"
                        : "bg-white/5 border border-white/5 text-white/90 rounded-tl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === "agent" && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.content)}
                        className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#E2FF6F]/80 hover:text-[#E2FF6F] flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {busy && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex max-w-[80%] gap-4"
                >
                  <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/20 text-[#E2FF6F] flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-6 py-4 rounded-[28px] rounded-tl-sm bg-white/5 border border-white/5 text-sm flex items-center gap-3 text-[#E2FF6F] font-bold overflow-hidden relative">
                    <Loader2 className="w-4 h-4 animate-spin text-[#E2FF6F]" /> COMPUTING...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 sm:p-6 bg-black/20 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 mb-3 min-h-8">
              <VoiceWaveform active={listening} />
              {listening && (
                <span className="text-xs font-bold text-[#E2FF6F] uppercase tracking-wide">Listening…</span>
              )}
              {!sttSupported && (
                <span className="text-[10px] text-white/35">Speech input not supported in this browser.</span>
              )}
            </div>
            <form
              className="flex gap-2 sm:gap-4 p-2 rounded-[24px] bg-white/5 border border-white/10 focus-within:border-[#E2FF6F]/30 transition-all duration-500 items-center"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <button
                type="button"
                disabled={!sttSupported || busy}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startListening();
                }}
                onMouseUp={stopListening}
                onMouseLeave={() => listening && stopListening()}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startListening();
                }}
                onTouchEnd={stopListening}
                className={cn(
                  "w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center border transition-all",
                  listening
                    ? "bg-rose-500/30 border-rose-400 text-rose-200"
                    : "bg-white/10 border-white/15 text-white hover:bg-[#E2FF6F]/20 hover:border-[#E2FF6F]/40",
                  (!sttSupported || busy) && "opacity-40 pointer-events-none"
                )}
                title="Hold to speak (browser speech recognition)"
                aria-pressed={listening}
              >
                <Mic className="w-5 h-5" />
              </button>
              <input
                className="flex-1 min-w-0 bg-transparent border-none outline-none px-2 sm:px-4 text-base text-white placeholder-white/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode.safeMode
                    ? "Type strictly (type 'exit' to pause)..."
                    : `Message in ${lang.label}…`
                }
                dir={lang.rtl ? "rtl" : "ltr"}
              />
              <Button
                type="submit"
                disabled={!input.trim() || busy}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E2FF6F] hover:bg-[#d4f056] text-black shadow-xl disabled:bg-white/10 disabled:text-white/20 shrink-0 p-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-[10px] text-white/30 mt-2 px-1">
              Hold the mic to dictate in <strong className="text-white/50">{lang.label}</strong>. Replies follow your
              selected language.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/5 bg-white/5 p-6 shadow-2xl lg:col-span-4 overflow-y-auto max-h-[calc(100vh-140px)] custom-scroll backdrop-blur-md">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-6">
            <Settings className="w-5 h-5 text-[#E2FF6F]" /> Agent Modules
          </h2>

          <div className="space-y-4 text-sm text-white/80 font-medium pb-6 border-b border-white/5">
            {[
              { label: "Hostel Safe Mode", val: mode.safeMode, op: (v: boolean) => setMode({ ...mode, safeMode: v }) },
              { label: "Lite Connection", val: mode.liteMode, op: (v: boolean) => setMode({ ...mode, liteMode: v }) },
              {
                label: "Goal-Oriented Action",
                val: mode.ventOrganizeAct,
                op: (v: boolean) => setMode({ ...mode, ventOrganizeAct: v }),
              },
              { label: "First-Gen Empathetic", val: firstGen, op: (v: boolean) => setFirstGen(v) },
            ].map((toggle) => (
              <label
                key={toggle.label}
                className="flex justify-between items-center bg-white/5 p-3 px-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span>{toggle.label}</span>
                <input
                  type="checkbox"
                  checked={toggle.val}
                  onChange={(e) => toggle.op(e.target.checked)}
                  className="accent-[#E2FF6F] w-4 h-4 rounded text-black border-transparent bg-white/20"
                />
              </label>
            ))}

            <div className="pt-2">
              <p className="text-[11px] text-white/40 uppercase font-black tracking-wider mb-2">
                Memory Persistence Layer
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["session", "Volatile"],
                  ["weekly", "Persistent"],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setConsentMemory(k as "session" | "weekly")}
                    className={cn(
                      "rounded-xl border py-2 text-xs font-bold transition-all",
                      consentMemory === k
                        ? "bg-[#E2FF6F] text-black border-[#E2FF6F]"
                        : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold mb-3">
                <BookOpen className="w-4 h-4 text-sky-400" /> Study Core
              </div>
              <div className="space-y-2">
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Exam week start (optional, YYYY-MM-DD)"
                  value={examStartDate}
                  onChange={(e) => setExamStartDate(e.target.value)}
                />
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Focus Subjects (Maths...)"
                  value={examSubjects}
                  onChange={(e) => setExamSubjects(e.target.value)}
                />
                <Button
                  disabled={busy}
                  onClick={async () => {
                    setExamPlan(null);
                    setBusy(true);
                    try {
                      const res = await fetch("/api/tools/exam-plan", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          startDate: examStartDate || undefined,
                          subjects: examSubjects.split(",").map((s) => s.trim()).filter(Boolean),
                          hoursPerDay: 3,
                          sleepWindow: "11pm–7am",
                        }),
                      });
                      const data = await res.json().catch(() => null);
                      if (!res.ok || !data?.plan) throw new Error("Failed");
                      setExamPlan(data.plan);
                    } catch {
                      setExamPlan("Core Error: Check external provider integration.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full rounded-xl bg-white/10 hover:bg-sky-400 hover:text-black hover:border-transparent text-white border border-white/10 transition-all text-xs font-bold py-5 mt-2"
                >
                  Activate Exam Routing
                </Button>
                {examPlan && (
                  <div className="mt-2 p-3 text-xs bg-sky-900/20 text-sky-200 border border-sky-500/20 rounded-xl leading-relaxed">
                    {examPlan}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold mb-3">
                <Sparkles className="w-4 h-4 text-purple-400" /> Insight Engine
              </div>
              <div className="space-y-2">
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Best moment..."
                  value={insightInputs.bestMoment}
                  onChange={(e) => setInsightInputs((s) => ({ ...s, bestMoment: e.target.value }))}
                />
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Worst moment..."
                  value={insightInputs.worstMoment}
                  onChange={(e) => setInsightInputs((s) => ({ ...s, worstMoment: e.target.value }))}
                />
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Improvement metric..."
                  value={insightInputs.oneImprovement}
                  onChange={(e) => setInsightInputs((s) => ({ ...s, oneImprovement: e.target.value }))}
                />
                <Button
                  disabled={busy}
                  onClick={async () => {
                    setInsightCard(null);
                    setBusy(true);
                    try {
                      const res = await fetch("/api/tools/insight-card", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ ...insightInputs, tone: "hinglish" }),
                      });
                      const data = await res.json().catch(() => null);
                      if (!res.ok || !data?.card) throw new Error("Failed");
                      setInsightCard(data.card);
                    } catch {
                      setInsightCard("Core Error: Provider unavailable.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full rounded-xl bg-white/10 hover:bg-purple-400 hover:text-black hover:border-transparent text-white border border-white/10 transition-all text-xs font-bold py-5 mt-2"
                >
                  Generate Card
                </Button>
                {insightCard && (
                  <div className="mt-2 p-3 text-xs bg-purple-900/20 text-purple-200 border border-purple-500/20 rounded-xl leading-relaxed whitespace-pre-wrap">
                    {insightCard}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold mb-3">
                <Zap className="w-4 h-4 text-amber-400" /> Decoder Array
              </div>
              <div className="space-y-2">
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Current state (Panic, tired)..."
                  value={guiltAnswer}
                  onChange={(e) => setGuiltAnswer(e.target.value)}
                />
                <Button
                  disabled={busy}
                  onClick={async () => {
                    setGuiltResult(null);
                    setBusy(true);
                    try {
                      const res = await fetch("/api/tools/study-guilt", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ answer: guiltAnswer }),
                      });
                      const data = await res.json().catch(() => null);
                      if (!res.ok || !data?.state) throw new Error();
                      setGuiltResult({ state: data.state, steps: data.steps });
                    } catch {
                      setGuiltResult({ state: "error", steps: ["Core Error: Decoder offline."] });
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black hover:border-transparent text-white border border-white/10 transition-all text-xs font-bold py-5 mt-2"
                >
                  Initialize Decay Route
                </Button>
                {guiltResult && (
                  <div className="mt-2 p-3 text-xs bg-amber-900/20 text-amber-200 border border-amber-500/20 rounded-xl leading-relaxed space-y-2">
                    <div className="font-bold border-b border-amber-500/10 pb-2">Status: {guiltResult.state}</div>
                    <ul className="list-disc pl-4 opacity-80">
                      {guiltResult.steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 font-bold mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Professor Script
              </div>
              <div className="space-y-2">
                <select
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white"
                  value={profType}
                  onChange={(e) => setProfType(e.target.value as typeof profType)}
                >
                  <option value="extension">Extension</option>
                  <option value="clarification">Clarification</option>
                  <option value="workload">Workload</option>
                </select>
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Course code"
                  value={profCourse}
                  onChange={(e) => setProfCourse(e.target.value)}
                />
                <input
                  className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-[#E2FF6F]/50 text-white placeholder-white/30"
                  placeholder="Deadline"
                  value={profDeadline}
                  onChange={(e) => setProfDeadline(e.target.value)}
                />
                <Button
                  disabled={busy}
                  onClick={async () => {
                    setProfScript(null);
                    setBusy(true);
                    try {
                      const res = await fetch("/api/tools/professor-script", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({
                          type: profType,
                          course: profCourse,
                          deadline: profDeadline,
                          tone: "very polite",
                        }),
                      });
                      const data = await res.json().catch(() => null);
                      if (!res.ok || !data?.text) throw new Error();
                      setProfScript(data.text);
                    } catch {
                      setProfScript("Core Error: Text assembly failed.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full rounded-xl bg-white/10 hover:bg-emerald-400 hover:text-black text-xs font-bold py-5"
                >
                  Generate script
                </Button>
                {profScript && (
                  <div className="mt-2 p-3 text-xs bg-emerald-900/20 text-emerald-200 border border-emerald-500/20 rounded-xl whitespace-pre-wrap">
                    {profScript}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
