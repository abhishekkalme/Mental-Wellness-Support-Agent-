'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Loader2,
  Settings,
  ChevronDown,
  Mic,
  Volume2,
  VolumeX,
  Languages,
  X,
  MoreHorizontal,
  Sparkles,
  BookOpen,
  Zap,
  Clock,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CHAT_LANGUAGE_STORAGE_KEY,
  getLanguageById,
  INDIAN_CHAT_LANGUAGES,
  type IndianChatLanguage,
} from '@/lib/chat/indianLanguages';
import { useStore } from '@/store/useStore';

type ChatMode = { safeMode: boolean; liteMode: boolean; ventOrganizeAct: boolean };
type ApiResponse = { risk: 'none' | 'elevated' | 'crisis'; reply: string };
type ChatMessage = { id: string; role: 'user' | 'agent'; content: string };

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((ev: { results: { length: number; [i: number]: { 0: { transcript: string } } } }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-0.5 h-5 sm:h-8" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-0.5 sm:w-1 rounded-full bg-[#E2FF6F] block"
          animate={{
            height: active ? [4, 14, 6, 12, 4] : 4,
            opacity: active ? [0.6, 1, 0.7, 1, 0.6] : 0.35,
          }}
          transition={{
            duration: 0.9,
            repeat: active ? Infinity : 0,
            delay: i * 0.12,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function EncryptedText({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text);
  const chars = '¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿@#$%^&*()_+{}[]|';

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }

    const interval = setInterval(() => {
      setDisplay((t) =>
        t
          .split('')
          .map((char) => {
            if (char === ' ' || char === '\n') return char;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
    }, 150);

    return () => clearInterval(interval);
  }, [active, text]);

  return (
    <span
      className={cn(
        'transition-all duration-500',
        active ? 'font-mono blur-[3px] opacity-50 select-none grayscale' : 'blur-0 opacity-100'
      )}
    >
      {display}
    </span>
  );
}

function getInitialLanguageId(): string {
  if (typeof window === 'undefined') return 'hi';
  const saved = localStorage.getItem(CHAT_LANGUAGE_STORAGE_KEY);
  if (saved && INDIAN_CHAT_LANGUAGES.some((l) => l.id === saved)) return saved;
  return 'hi';
}

function QuickModuleButton({
  icon: Icon,
  label,
  onClick,
  color,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all',
        color
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function AgentChatPage() {
  const store = useStore();
  const [langId, setLangId] = useState('hi');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const lang = useMemo(() => getLanguageById(langId), [langId]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'welcome', role: 'agent', content: getLanguageById('hi').welcomeLine },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Omit<ChatMode, 'safeMode'>>({
    liteMode: false,
    ventOrganizeAct: true,
  });
  const [firstGen, setFirstGen] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [consentMemory, setConsentMemory] = useState<'session' | 'weekly'>('session');

  const [speakReplies, setSpeakReplies] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);

  const [examStartDate, setExamStartDate] = useState('');
  const [examSubjects, setExamSubjects] = useState('');
  const [examPlan, setExamPlan] = useState<string | null>(null);

  const [insightInputs, setInsightInputs] = useState({
    bestMoment: '',
    worstMoment: '',
    oneImprovement: '',
  });
  const [insightCard, setInsightCard] = useState<string | null>(null);

  const [guiltAnswer, setGuiltAnswer] = useState('');
  const [guiltResult, setGuiltResult] = useState<{ state: string; steps: string[] } | null>(null);

  const [profType, setProfType] = useState<'extension' | 'clarification' | 'workload'>('extension');
  const [profCourse, setProfCourse] = useState('');
  const [profDeadline, setProfDeadline] = useState('');
  const [profScript, setProfScript] = useState<string | null>(null);

  useEffect(() => {
    const id = getInitialLanguageId();
    setLangId(id);
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === 'welcome'
        ? [{ id: 'welcome', role: 'agent', content: getLanguageById(id).welcomeLine }]
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
    if (typeof window === 'undefined') return;
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
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const pickVoice = useCallback((speechLang: string) => {
    if (typeof window === 'undefined') return null;
    const voices = window.speechSynthesis.getVoices();
    const [base] = speechLang.split('-');
    return (
      voices.find((v) => v.lang === speechLang) ||
      voices.find((v) => v.lang.startsWith(base + '-')) ||
      voices.find((v) => v.lang.startsWith(base)) ||
      null
    );
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const load = () => pickVoice(lang.speechLang);
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang.speechLang, pickVoice]);

  const speakText = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !text.trim()) return;
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
    if (typeof window === 'undefined') return;
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
      let text = '';
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

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    if (store.safeMode && text.toLowerCase() === 'exit') {
      setMessages((p) => [
        ...p,
        { id: Date.now().toString(), role: 'user', content: text },
        {
          id: (Date.now() + 1).toString(),
          role: 'agent',
          content: 'Okay. Pausing for now. Jab ready ho, bas hi type kar dena.',
        },
      ]);
      setInput('');
      return;
    }

    const nextMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user' as const, content: text },
    ];
    setMessages(nextMessages);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          chatLanguage: langId,
          mode: { ...mode, safeMode: store.safeMode },
          context: {
            firstGen,
            consentMemory,
            examWeek: {
              startDate: examStartDate || undefined,
              subjects: examSubjects
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            },
          },
        }),
      });
      const data = (await res.json().catch(() => null)) as ApiResponse | null;
      if (!res.ok || !data?.reply) throw new Error('API Exception');
      const reply = data.reply;
      setMessages((p) => [...p, { id: Date.now().toString(), role: 'agent', content: reply }]);
      if (speakReplies) speakText(reply);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: Date.now().toString(),
          role: 'agent',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function resetThread() {
    stopListening();
    setMessages([{ id: 'welcome', role: 'agent', content: lang.welcomeLine }]);
  }

  function onLanguageSelect(next: IndianChatLanguage) {
    setLangId(next.id);
    setLangMenuOpen(false);
  }

  function openTool(tool: string) {
    setShowModules(true);
    setActiveTool(tool);
  }
  const topBarButton ='h-9 px-3 flex items-center justify-center rounded-full border transition-all shrink-0 bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white';
  
  return (
    <div className="flex flex-col h-screen max-h-screen relative overflow-hidden bg-[#0A0D08]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#E2FF6F]/5 blur-[100px] sm:blur-[120px] rounded-full" />
        <div className="absolute bottom-20 sm:bottom-40 left-0 w-48 h-48 sm:w-80 sm:h-80 bg-[#E2FF6F]/3 blur-[80px] sm:blur-[100px] rounded-full" />
      </div>

      <header className="h-14 sm:h-auto sm:min-h-20 border-b border-white/5 flex items-center justify-between px-2 sm:px-8 py-2 z-50 shrink-0 bg-[#0A0D08]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#E2FF6F]/10 flex items-center justify-center border border-[#E2FF6F]/20 shrink-0">
            <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-[#E2FF6F]" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              Wellness Agent
              <span className="text-[9px] bg-[#E2FF6F] text-black px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                ML
              </span>
            </h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] truncate">
              Neural Connection · {lang.nativeLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">

  <button
    type="button"
    onClick={() => store.setSafeMode(!store.safeMode)}
    className={cn(
      topBarButton,
      store.safeMode &&
        'bg-rose-500/15 border-rose-400/30 text-rose-200'
    )}
  >
    Safe Mode
  </button>

  <button
    type="button"
    onClick={() => setFirstGen(!firstGen)}
    className={cn(
      topBarButton,
      firstGen &&
        'bg-cyan-500/15 border-cyan-400/30 text-cyan-200'
    )}
    title="Start fresh: AI responds as if it's meeting you for the first time, with no memory of previous conversations."
  >
    1st Gen
  </button>

  <button
    type="button"
    onClick={() => setSpeakReplies((v) => !v)}
    className={cn(
      topBarButton,
      'w-9 px-0',
      speakReplies &&
        'bg-[#E2FF6F]/10 border-[#E2FF6F]/30 text-[#E2FF6F]'
    )}
    aria-label={speakReplies ? 'Disable voice' : 'Enable voice'}
  >
    {speakReplies ? (
      <Volume2 className="w-4 h-4" />
    ) : (
      <VolumeX className="w-4 h-4" />
    )}
  </button>



          <div className="relative ml-1" ref={langMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLangMenuOpen((o) => !o);
              }}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold transition-colors',
                'bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-[#E2FF6F]/40',
                lang.rtl && 'flex-row-reverse'
              )}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
            >
              <span className="text-base sm:text-lg leading-none" aria-hidden>
                {lang.flag}
              </span>
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E2FF6F] shrink-0" />
              <span className="max-w-[60px] sm:max-w-[160px] truncate hidden sm:block">{lang.label}</span>
              <ChevronDown
                className={cn(
                  'w-3 h-3 sm:w-4 sm:h-4 opacity-60 transition-transform',
                  langMenuOpen && 'rotate-180'
                )}
              />
            </button>
            

            <AnimatePresence>
              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 sm:right-auto left-0 sm:left-auto mt-2 w-[calc(100vw-1rem)] sm:w-[min(100vw-2rem,320px)] max-h-64 sm:max-h-72 overflow-y-auto rounded-xl sm:rounded-2xl border border-white/10 bg-[#0f120e] shadow-2xl z-50 py-1"
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
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors',
                        l.id === langId && 'bg-[#E2FF6F]/15 text-[#E2FF6F]',
                        l.rtl && 'flex-row-reverse text-right'
                      )}
                    >
                      <span className="text-lg">{l.flag}</span>
                      <span className="flex-1 min-w-0">
                        <span className="font-bold block truncate">{l.label}</span>
                        <span className="text-xs text-white/45 block truncate">
                          {l.nativeLabel}
                        </span>
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setShowModules(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#E2FF6F]/40 transition-colors"
            aria-label="Tools"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          
        </div>
      </header>

      <section className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 sm:space-y-6 min-h-0"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  'flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 sm:w-10 sm:h-10 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-500',
                    msg.role === 'user'
                      ? 'bg-white/5 border-white/10 text-white/40'
                      : 'bg-[#E2FF6F]/10 border-[#E2FF6F]/20 text-[#E2FF6F]'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div
                  className={cn(
                    'px-3 py-2 sm:px-6 sm:py-4 rounded-xl sm:rounded-[28px] text-sm sm:text-[15px] font-medium leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#E2FF6F] text-black rounded-br-sm sm:shadow-[#E2FF6F]/5'
                      : 'bg-white/5 border border-white/5 text-white/90 rounded-bl-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    <EncryptedText text={msg.content} active={store.safeMode} />
                  </p>
                  {msg.role === 'agent' && !store.safeMode && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.content)}
                      className="mt-1 sm:mt-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#E2FF6F]/80 hover:text-[#E2FF6F] flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3.5 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">Listen</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {busy && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex max-w-[80%] gap-3"
              >
                <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/20 text-[#E2FF6F] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-4 py-3 rounded-xl rounded-bl-sm bg-white/5 border border-white/5 text-sm flex items-center gap-2 text-[#E2FF6F] font-bold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">COMPUTING...</span>
                  <span className="sm:hidden">...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-3 sm:px-6 pb-3 sm:pb-6 pt-2 bg-gradient-to-t from-[#0A0D08] via-[#0A0D08]/90 to-transparent">
          {listening && (
            <div className="flex items-center gap-2 mb-2">
              <VoiceWaveform active={listening} />
              <span className="text-xs font-bold text-[#E2FF6F]">Listening...</span>
            </div>
          )}
          <form
            className="flex gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/5 border border-white/10 focus-within:border-[#E2FF6F]/30 transition-all items-center"
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
                'w-9 h-9 sm:w-12 sm:h-12 shrink-0 rounded-xl sm:rounded-full flex items-center justify-center border transition-all',
                listening
                  ? 'bg-rose-500/30 border-rose-400 text-rose-200'
                  : 'bg-white/10 border-white/15 text-white hover:bg-[#E2FF6F]/20 hover:border-[#E2FF6F]/40',
                (!sttSupported || busy) && 'opacity-40 pointer-events-none'
              )}
              aria-pressed={listening}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <input
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder-white/30"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={store.safeMode ? "Type 'exit' to pause..." : 'Message...'}
              dir={lang.rtl ? 'rtl' : 'ltr'}
            />
            <Button
              type="submit"
              disabled={!input.trim() || busy}
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-full bg-[#E2FF6F] hover:bg-[#d4f056] text-black shadow-lg disabled:bg-white/10 disabled:text-white/20 shrink-0 p-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </form>
        </div>
      </section>

      <AnimatePresence>
        {showModules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => {
              setShowModules(false);
              setActiveTool(null);
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-md sm:rounded-3xl bg-[#0A0D08] border border-white/10 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#0A0D08]/90 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Tools</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModules(false);
                    setActiveTool(null);
                  }}
                  className="p-2 -mr-2 text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  <QuickModuleButton
                    icon={BookOpen}
                    label="Study Plan"
                    onClick={() => openTool('exam')}
                    color="bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
                  />
                  <QuickModuleButton
                    icon={Lightbulb}
                    label="Daily Insight"
                    onClick={() => openTool('insight')}
                    color="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                  />
                  <QuickModuleButton
                    icon={Zap}
                    label="Reset Focus"
                    onClick={() => openTool('guilt')}
                    color="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                  />
                  <QuickModuleButton
                    icon={MessageSquare}
                    label="Email Draft"
                    onClick={() => openTool('prof')}
                    color="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {activeTool === 'exam' && (
                    <motion.div
                      key="exam"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2 border-t border-white/5"
                    >
                      <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Study Plan
                      </h3>
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-sky-500/50 text-white placeholder-white/30"
                        placeholder="Exam date (YYYY-MM-DD)"
                        value={examStartDate}
                        onChange={(e) => setExamStartDate(e.target.value)}
                      />
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-sky-500/50 text-white placeholder-white/30"
                        placeholder="Subjects (Maths, Physics...)"
                        value={examSubjects}
                        onChange={(e) => setExamSubjects(e.target.value)}
                      />
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          setExamPlan(null);
                          setBusy(true);
                          try {
                            const res = await fetch('/api/tools/exam-plan', {
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({
                                startDate: examStartDate || undefined,
                                subjects: examSubjects
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                                hoursPerDay: 3,
                                sleepWindow: '11pm–7am',
                              }),
                            });
                            const data = await res.json().catch(() => null);
                            if (!res.ok || !data?.plan) throw new Error('Failed');
                            setExamPlan(data.plan);
                          } catch {
                            setExamPlan('Error generating plan.');
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="w-full rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/20 text-xs font-bold py-3"
                      >
                        Generate Plan
                      </Button>
                      {examPlan && (
                        <div className="p-3 text-xs bg-sky-900/20 text-sky-200 border border-sky-500/20 rounded-xl whitespace-pre-wrap">
                          {examPlan}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTool === 'insight' && (
                    <motion.div
                      key="insight"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2 border-t border-white/5"
                    >
                      <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Daily Insight
                      </h3>
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-purple-500/50 text-white placeholder-white/30"
                        placeholder="Best moment today"
                        value={insightInputs.bestMoment}
                        onChange={(e) => setInsightInputs((s) => ({ ...s, bestMoment: e.target.value }))}
                      />
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-purple-500/50 text-white placeholder-white/30"
                        placeholder="Worst moment"
                        value={insightInputs.worstMoment}
                        onChange={(e) => setInsightInputs((s) => ({ ...s, worstMoment: e.target.value }))}
                      />
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-purple-500/50 text-white placeholder-white/30"
                        placeholder="One improvement"
                        value={insightInputs.oneImprovement}
                        onChange={(e) =>
                          setInsightInputs((s) => ({ ...s, oneImprovement: e.target.value }))
                        }
                      />
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          setInsightCard(null);
                          setBusy(true);
                          try {
                            const res = await fetch('/api/tools/insight-card', {
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({ ...insightInputs, tone: 'hinglish' }),
                            });
                            const data = await res.json().catch(() => null);
                            if (!res.ok || !data?.card) throw new Error('Failed');
                            setInsightCard(data.card);
                          } catch {
                            setInsightCard('Error generating insight.');
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="w-full rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20 text-xs font-bold py-3"
                      >
                        Generate
                      </Button>
                      {insightCard && (
                        <div className="p-3 text-xs bg-purple-900/20 text-purple-200 border border-purple-500/20 rounded-xl whitespace-pre-wrap">
                          {insightCard}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTool === 'guilt' && (
                    <motion.div
                      key="guilt"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2 border-t border-white/5"
                    >
                      <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Reset Focus
                      </h3>
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-amber-500/50 text-white placeholder-white/30"
                        placeholder="How do you feel? (tired, guilty...)"
                        value={guiltAnswer}
                        onChange={(e) => setGuiltAnswer(e.target.value)}
                      />
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          setGuiltResult(null);
                          setBusy(true);
                          try {
                            const res = await fetch('/api/tools/study-guilt', {
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({ answer: guiltAnswer }),
                            });
                            const data = await res.json().catch(() => null);
                            if (!res.ok || !data?.state) throw new Error();
                            setGuiltResult({ state: data.state, steps: data.steps });
                          } catch {
                            setGuiltResult({ state: 'error', steps: ['Something went wrong.'] });
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="w-full rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/20 text-xs font-bold py-3"
                      >
                        Get Guidance
                      </Button>
                      {guiltResult && (
                        <div className="p-3 text-xs bg-amber-900/20 text-amber-200 border border-amber-500/20 rounded-xl space-y-2">
                          <div className="font-bold border-b border-amber-500/10 pb-2">
                            {guiltResult.state}
                          </div>
                          <ul className="list-disc pl-4 opacity-80">
                            {guiltResult.steps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTool === 'prof' && (
                    <motion.div
                      key="prof"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2 border-t border-white/5"
                    >
                      <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Email Draft
                      </h3>
                      <select
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-emerald-500/50 text-white"
                        value={profType}
                        onChange={(e) => setProfType(e.target.value as typeof profType)}
                      >
                        <option value="extension">Extension Request</option>
                        <option value="clarification">Clarification</option>
                        <option value="workload">Workload Discussion</option>
                      </select>
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-emerald-500/50 text-white placeholder-white/30"
                        placeholder="Course (CS101)"
                        value={profCourse}
                        onChange={(e) => setProfCourse(e.target.value)}
                      />
                      <input
                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-emerald-500/50 text-white placeholder-white/30"
                        placeholder="Deadline (Tomorrow 5pm)"
                        value={profDeadline}
                        onChange={(e) => setProfDeadline(e.target.value)}
                      />
                      <Button
                        disabled={busy}
                        onClick={async () => {
                          setProfScript(null);
                          setBusy(true);
                          try {
                            const res = await fetch('/api/tools/professor-script', {
                              method: 'POST',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({
                                type: profType,
                                course: profCourse,
                                deadline: profDeadline,
                                tone: 'polite',
                              }),
                            });
                            const data = await res.json().catch(() => null);
                            if (!res.ok || !data?.text) throw new Error();
                            setProfScript(data.text);
                          } catch {
                            setProfScript('Error generating draft.');
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="w-full rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/20 text-xs font-bold py-3"
                      >
                        Generate Draft
                      </Button>
                      {profScript && (
                        <div className="p-3 text-xs bg-emerald-900/20 text-emerald-200 border border-emerald-500/20 rounded-xl whitespace-pre-wrap">
                          {profScript}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}