"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Book, Check, Sparkles, AlertCircle, Moon, FileText } from "lucide-react";
import { motion } from "framer-motion";

const journalModes = [
  { id: "free", label: "Open Journal", icon: FileText, placeholder: "Brain dump: Write everything that comes to mind without filtering..." },
  { id: "gratitude", label: "Gratitude", icon: Sparkles, placeholder: "What are three things you're grateful for today?" },
  { id: "reflection", label: "Deep Reflection", icon: Book, placeholder: "What did you learn about yourself today? How did your actions align with your goals?" },
  { id: "problem", label: "Problem Solving", icon: AlertCircle, placeholder: "What is the core issue troubling you? What is one extremely small step you can take?" },
  { id: "sleep", label: "Sleep Journal", icon: Moon, placeholder: "What is keeping your mind busy tonight? Dump it here so you can sleep." },
];

export default function JournalPage() {
  const store = useStore();
  const [content, setContent] = useState("");
  const [modeId, setModeId] = useState("free");
  const [saved, setSaved] = useState(false);

  const activeMode = journalModes.find(m => m.id === modeId)!;

  const handleSave = () => {
    if (!content.trim()) return;

    store.addJournalEntry({
      id: Date.now().toString(),
      prompt: `[${activeMode.label}] - ${activeMode.placeholder}`,
      content,
      emotionTags: [],
      timestamp: new Date().toISOString()
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setContent("");
    }, 2500);
  };

  return (
    <main className="p-12 max-w-7xl mx-auto space-y-16">
      <header className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tighter text-white">Reflective Consciousness</h1>
        <p className="text-white/40 text-xl font-medium tracking-wide">Pick a structural template to direct your internal dialogue.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-3 flex flex-col">
          {journalModes.map((m) => (
            <button
              key={m.id}
              onClick={() => { setModeId(m.id); setContent(""); }}
              className={`flex items-center gap-4 w-full text-left px-6 py-4 rounded-[24px] transition-all duration-500 border ${
                modeId === m.id 
                  ? "bg-[#E2FF6F] text-black border-[#E2FF6F] shadow-xl shadow-[#E2FF6F]/20 scale-105 z-10" 
                  : "bg-white/5 text-white/40 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10"
              }`}
            >
              <m.icon className={`w-5 h-5 shrink-0 ${modeId === m.id ? "text-black" : "text-[#E2FF6F]/40"}`} />
              <span className="font-bold text-sm tracking-tight">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-12">
          <div className="glass-panel p-12 shadow-2xl flex flex-col h-[650px] border-white/5 bg-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <activeMode.icon className="w-64 h-64 text-[#E2FF6F]" />
            </div>

            <div className="relative z-10">
              <h3 className="font-bold text-3xl text-white tracking-tight mb-3 flex items-center gap-4">
                <activeMode.icon className="w-8 h-8 text-[#E2FF6F]" /> {activeMode.label}
              </h3>
              <p className="text-lg text-white/30 mb-10 pb-6 border-b border-white/5 font-medium italic tracking-wide">{activeMode.placeholder}</p>
            </div>

            {saved ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-8 relative z-10"
              >
                <div className="w-24 h-24 rounded-[32px] bg-[#E2FF6F]/10 text-[#E2FF6F] flex items-center justify-center shadow-2xl shadow-[#E2FF6F]/10">
                  <Check className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">Ritual Uploaded</h3>
                  <p className="text-white/40 mt-4 text-lg font-medium">Your consciousness state has been securely persisted.</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col relative z-10">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Initiate flow..."
                  className="flex-1 w-full bg-transparent resize-none outline-none text-xl leading-[1.8] text-white/80 placeholder:text-white/10 font-medium"
                  autoFocus
                />
                <div className="pt-8 mt-auto border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#E2FF6F] px-4 py-2 rounded-full bg-[#E2FF6F]/10 uppercase tracking-[0.2em] border border-[#E2FF6F]/20">
                    {content.length} BITSTREAM LENGTH
                  </span>
                  <Button 
                    onClick={handleSave} 
                    disabled={!content.trim()} 
                    className="h-14 px-10 rounded-[20px] bg-[#E2FF6F] hover:bg-[#d4f056] text-black font-bold text-sm tracking-widest uppercase shadow-xl shadow-[#E2FF6F]/10 active:scale-95 disabled:bg-white/5 disabled:text-white/10 transition-all font-bold"
                  >
                        Seal Perception
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <h3 className="font-bold text-xs text-[#E2FF6F]/40 uppercase tracking-[0.3em] pl-2">Timeline History</h3>
            {store.journalEntries.length === 0 ? (
              <div className="p-16 text-center glass-panel shadow-2xl text-lg text-white/20 italic rounded-[40px] border-white/5 bg-white/[0.02]">
                Your subjective history is currently unwritten.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {store.journalEntries.slice(-4).reverse().map((entry) => (
                  <div key={entry.id} className="p-8 rounded-[40px] glass-panel shadow-2xl cursor-pointer hover:border-[#E2FF6F]/30 transition-all duration-500 bg-white/5 border-white/5 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                         <FileText className="w-16 h-16 text-[#E2FF6F]" />
                    </div>
                    <p className="text-[10px] font-bold text-[#E2FF6F] mb-4 uppercase tracking-[0.2em]">{entry.prompt.split("]")[0]}]</p>
                    <p className="text-base text-white/40 font-medium line-clamp-3 mb-6 leading-relaxed group-hover:text-white/70 transition-colors">{entry.content}</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-[2px] bg-[#E2FF6F]/30 group-hover:w-12 transition-all" />
                        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                        {format(new Date(entry.timestamp), "MMM d, yyyy")}
                        </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
