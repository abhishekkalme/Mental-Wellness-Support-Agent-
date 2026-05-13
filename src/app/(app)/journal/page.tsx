'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Book, Check, Sparkles, AlertCircle, Moon, FileText, BookText } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function JournalPage() {
  const store = useStore();
  const [content, setContent] = useState('');
  const [modeId, setModeId] = useState('free');
  const [saved, setSaved] = useState(false);

  const activeMode = journalModes.find((m) => m.id === modeId)!;

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
    <main className="p-4 md:p-12 max-w-7xl mx-auto space-y-8 md:space-y-16 relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/5 blur-[150px] rounded-full" />
      </div>

      <header className="space-y-4 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Journal</h1>
        <p className="text-white/40 text-lg md:text-xl font-medium">
          Pick a template to guide your reflection.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
        <div className="lg:col-span-1 space-y-2 flex flex-col">
          {journalModes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setModeId(m.id);
                setContent('');
              }}
              className={`flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 border ${
                modeId === m.id
                  ? 'bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-lg shadow-[#E2FF6F]/20'
                  : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:text-white hover:bg-white/[0.06] hover:border-white/20'
              }`}
            >
              <m.icon
                className={`w-5 h-5 shrink-0 ${modeId === m.id ? 'text-black' : 'text-[#E2FF6F]/40'}`}
              />
              <span className="font-bold text-sm">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-8 md:space-y-12">
          <div className="glass-panel p-6 md:p-10 shadow-2xl flex flex-col min-h-[500px] md:h-[600px] border-white/[0.06] bg-white/[0.03] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
              <activeMode.icon className="w-64 h-64 text-[#E2FF6F]" />
            </div>

            <div className="relative z-10">
              <h3 className="font-bold text-2xl md:text-3xl text-white tracking-tight mb-3 flex items-center gap-3">
                <activeMode.icon className="w-7 h-7 text-[#E2FF6F]" /> {activeMode.label}
              </h3>
              <p className="text-sm md:text-base text-white/30 mb-8 pb-6 border-b border-white/[0.06] font-medium italic">
                {activeMode.placeholder}
              </p>
            </div>

            {saved ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-6 relative z-10"
              >
                <div className="w-24 h-24 rounded-3xl bg-[#E2FF6F]/10 text-[#E2FF6F] flex items-center justify-center shadow-2xl shadow-[#E2FF6F]/10">
                  <Check className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">Entry Saved</h3>
                  <p className="text-white/40 mt-3 text-base font-medium">
                    Your thoughts have been recorded.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col relative z-10">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing..."
                  className="flex-1 w-full bg-transparent resize-none outline-none text-lg md:text-xl leading-[1.8] text-white/70 placeholder:text-white/[0.08] font-medium"
                  autoFocus
                />
                <div className="pt-6 mt-auto border-t border-white/[0.06] flex items-center justify-between gap-4 flex-wrap">
                  <span className="text-[11px] font-semibold text-white/30 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    {content.length} characters
                  </span>
                  <Button
                    onClick={handleSave}
                    disabled={!content.trim()}
                    className="h-12 md:h-14 px-8 rounded-2xl bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold text-sm shadow-xl shadow-[#E2FF6F]/10 active:scale-95 disabled:bg-white/[0.04] disabled:text-white/20 transition-all"
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-xs text-white/30 uppercase tracking-[0.2em] pl-2">
              Recent Entries
            </h3>
            {store.journalEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 md:p-16 text-center glass-panel rounded-3xl border-white/[0.06] bg-white/[0.02] space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-[#E2FF6F]/10 flex items-center justify-center mx-auto">
                  <BookText className="w-10 h-10 text-[#E2FF6F]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Your journal is empty</h3>
                  <p className="text-white/40 max-w-md mx-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.journalEntries
                  .slice(-4)
                  .reverse()
                  .map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl glass-panel cursor-pointer hover:border-[#E2FF6F]/30 transition-all duration-300 bg-white/[0.03] border-white/[0.06] group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-[0.04] transition-opacity">
                        <FileText className="w-16 h-16 text-[#E2FF6F]" />
                      </div>
                      <p className="text-[10px] font-bold text-[#E2FF6F] mb-3 uppercase tracking-[0.15em]">
                        {entry.prompt.split(']')[0].replace('[', '')}
                      </p>
                      <p className="text-sm text-white/40 font-medium line-clamp-3 mb-4 leading-relaxed group-hover:text-white/60 transition-colors">
                        {entry.content}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-[2px] bg-[#E2FF6F]/20 group-hover:w-10 transition-all" />
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] font-medium">
                          {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
