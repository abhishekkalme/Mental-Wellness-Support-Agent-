'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Book, Check, Sparkles, AlertCircle, Moon, FileText, BookText, Plus } from 'lucide-react';

const journalModes = [
  {
    id: 'free',
    label: 'Open Journal',
    icon: FileText,
    placeholder: 'Brain dump: Write everything that comes to mind without filtering...',
  },
  {
    id: 'gratitude',
    label: 'Gratitude',
    icon: Sparkles,
    placeholder: "What are three things you're grateful for today?",
  },
  {
    id: 'reflection',
    label: 'Deep Reflection',
    icon: Book,
    placeholder:
      'What did you learn about yourself today? How did your actions align with your goals?',
  },
  {
    id: 'problem',
    label: 'Problem Solving',
    icon: AlertCircle,
    placeholder:
      'What is the core issue troubling you? What is one extremely small step you can take?',
  },
  {
    id: 'sleep',
    label: 'Sleep Journal',
    icon: Moon,
    placeholder: 'What is keeping your mind busy tonight? Dump it here so you can sleep.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const modeColors: Record<string, string> = {
  free: 'text-cyan-400',
  gratitude: 'text-amber-400',
  reflection: 'text-emerald-400',
  problem: 'text-rose-400',
  sleep: 'text-[#C8B6FF]',
};

export default function JournalPage() {
  const store = useStore();
  const [content, setContent] = useState('');
  const [modeId, setModeId] = useState('free');
  const [saved, setSaved] = useState(false);

  const activeMode = journalModes.find((m) => m.id === modeId)!;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = () => {
    if (!content.trim()) return;
    store.addJournalEntry({
      id: Date.now().toString(),
      prompt: `[${activeMode.label}] - ${activeMode.placeholder}`,
      content,
      emotionTags: [],
      timestamp: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setContent('');
    }, 2500);
  };

  return (
    <main
      id="main-content"
      className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-16 relative"
    >
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Journal</h1>
        <p className="text-white/70 text-lg md:text-xl font-medium">
          Pick a template to guide your reflection.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-1 space-y-2 flex flex-col"
        >
          {journalModes.map((m, i) => {
            const active = modeId === m.id;
            return (
              <motion.button
                key={m.id}
                variants={item}
                transition={{ delay: i * 0.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setModeId(m.id);
                  setContent('');
                }}
                className={`flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 border ${
                  active
                    ? 'bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20'
                    : 'bg-white/[0.03] text-white/60 border-white/[0.06] hover:text-white hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <m.icon
                  className={`w-5 h-5 shrink-0 ${active ? 'text-black' : modeColors[m.id]}`}
                />
                <span className="font-bold text-sm">{m.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className="lg:col-span-3 space-y-8 md:space-y-12">
          <div className="surface-card p-6 md:p-10 flex flex-col min-h-[500px] md:h-[600px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 flex flex-col items-center justify-center text-center gap-6 relative z-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 12 }}
                    className="w-24 h-24 rounded-3xl bg-[#E2FF6F]/10 text-[#E2FF6F] flex items-center justify-center shadow-2xl shadow-[#E2FF6F]/10"
                  >
                    <Check className="w-12 h-12" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight">Entry Saved</h3>
                    <p className="text-white/70 mt-3 text-base font-medium">
                      Your thoughts have been recorded.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col relative z-10"
                >
                  <motion.div
                    key={modeId}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10"
                  >
                    <h3 className="font-bold text-2xl md:text-3xl text-white tracking-tight mb-3 flex items-center gap-3">
                      <activeMode.icon className={`w-7 h-7 ${modeColors[modeId]}`} />{' '}
                      {activeMode.label}
                    </h3>
                    <p className="text-sm md:text-base text-white/50 mb-8 pb-6 border-b border-white/[0.06] font-medium italic">
                      {activeMode.placeholder}
                    </p>
                  </motion.div>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing..."
                    className="flex-1 w-full bg-transparent resize-none outline-none text-lg md:text-xl leading-[1.8] text-white/70 placeholder:text-white/[0.12] font-medium border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 min-h-[300px]"
                  />
                  <div className="pt-6 mt-auto border-t border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-white/50 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        {wordCount} words
                      </span>
                      <span className="text-[11px] text-white/30 tabular-nums">
                        {content.length} chars
                      </span>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={!content.trim()}
                      className="h-12 md:h-14 px-8 rounded-2xl bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold text-sm shadow-xl shadow-[#E2FF6F]/10 disabled:bg-white/[0.04] disabled:text-white/40 transition-all"
                    >
                      Save Entry
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-white/50 uppercase tracking-[0.2em] pl-2">
                Recent Entries
              </h3>
              {store.journalEntries.length > 0 && (
                <span className="text-[11px] text-white/30 tabular-nums">
                  {store.journalEntries.length} total
                </span>
              )}
            </div>
            {store.journalEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 md:p-16 text-center surface-card space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center mx-auto">
                  <BookText className="w-10 h-10 text-[#E2FF6F]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Your journal is empty</h3>
                  <p className="text-white/70 max-w-md mx-auto">
                    Writing helps process emotions and gain clarity
                  </p>
                </div>
                <Button
                  onClick={() => document.querySelector('textarea')?.focus()}
                  className="h-12 px-8 bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold rounded-full"
                >
                  Write Your First Entry
                </Button>
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {store.journalEntries
                  .slice(-4)
                  .reverse()
                  .map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      variants={item}
                      transition={{ delay: i * 0.04 }}
                      className="p-6 rounded-2xl surface-card cursor-pointer hover:border-[#E2FF6F]/30 transition-all duration-300 group overflow-hidden relative"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {journalModes.find((m) => entry.prompt.includes(m.label)) && (
                          <span
                            className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]"
                            style={{
                              color:
                                modeColors[
                                  journalModes.find((m) => entry.prompt.includes(m.label))!.id
                                ],
                            }}
                          >
                            {journalModes.find((m) => entry.prompt.includes(m.label))!.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white/60 font-medium line-clamp-3 mb-4 leading-relaxed group-hover:text-white/70 transition-colors">
                        {entry.content}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-[2px] bg-[#E2FF6F]/20 group-hover:w-10 transition-all" />
                        <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-medium">
                          {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
