"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  "I'm feeling a bit anxious about tomorrow.",
  "I can't seem to stop overthinking.",
  "I need a short grounding exercise.",
  "Just checking in to log my mood.",
];

export default function ChatPage() {
  const store = useStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [store.chatHistory, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    
    store.addChatMessage(userMsg);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: store.name || "anonymous", message: text })
      });
      
      const json = await response.json();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: json?.data?.reply || "I'm having trouble connecting to my servers right now.",
        timestamp: new Date().toISOString()
      };
      
      store.addChatMessage(aiMsg);
    } catch (err) {
      store.addChatMessage({
        id: Date.now().toString(),
        role: "agent",
        content: "Network error interacting with AI backend.",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-transparent relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#E2FF6F]/3 blur-[100px] rounded-full" />
      </div>

      <header className="h-20 border-b border-white/5 flex items-center px-10 glass-panel rounded-none border-x-0 border-t-0 z-10 shrink-0 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center border border-[#E2FF6F]/20">
             <Bot className="w-6 h-6 text-[#E2FF6F]" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-tight flex items-center gap-3">
               MindCare Core <span className="text-[10px] bg-[#E2FF6F] text-black px-2 py-0.5 rounded-full font-black tracking-widest uppercase">Agentic</span>
            </h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Neural Connection Active</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-10 relative z-10" ref={scrollRef}>
        {store.chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-10">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-[32px] bg-[#E2FF6F]/10 flex items-center justify-center text-[#E2FF6F] mb-4 border border-[#E2FF6F]/20 shadow-2xl shadow-[#E2FF6F]/5"
            >
              <Bot className="w-12 h-12" />
            </motion.div>
            <div className="space-y-4">
                <p className="text-3xl font-bold text-white tracking-tighter">
                Synchronizing with {store.name || "User"}...
                </p>
                <p className="text-white/40 text-lg font-medium italic">
                    "I am the vessel for your unstructured thought. What patterns shall we observe today?"
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 w-full">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-sm text-white/40 font-medium hover:text-[#E2FF6F] hover:bg-white/10 hover:border-[#E2FF6F]/30 transition-all duration-500"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {store.chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex max-w-[85%] gap-5",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500",
                msg.role === "user" ? "bg-white/5 border-white/10 text-white/40" : "bg-[#E2FF6F]/10 border-[#E2FF6F]/20 text-[#E2FF6F]"
              )}>
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn(
                "px-6 py-4 rounded-[32px] text-base font-medium leading-relaxed shadow-2xl transition-all duration-500",
                msg.role === "user" 
                  ? "bg-[#E2FF6F] text-black rounded-tr-sm font-bold shadow-[#E2FF6F]/5" 
                  : msg.content.includes("CRITICAL_SAFETY_TRIGGER") 
                    ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-tl-sm shadow-rose-500/5"
                    : "bg-white/5 border border-white/5 text-white/80 rounded-tl-sm hover:bg-white/10"
              )}>
                {msg.content.replace("CRITICAL_SAFETY_TRIGGER: ", "")}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex max-w-[80%] gap-5">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#E2FF6F]/10 border border-[#E2FF6F]/20 text-[#E2FF6F] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="px-6 py-4 rounded-[32px] bg-white/5 border border-white/5 rounded-tl-sm text-sm flex items-center gap-3 text-white/30 font-bold overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E2FF6F]/5 to-transparent animate-shimmer" />
              <Loader2 className="w-4 h-4 animate-spin text-[#E2FF6F]" /> COMPUTING RESPONSE...
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-transparent shrink-0 relative z-10">
        <form 
          className="max-w-5xl mx-auto flex gap-4 p-2 rounded-[32px] bg-white/5 border border-white/5 shadow-2xl focus-within:border-[#E2FF6F]/30 transition-all duration-500"
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Transmit structured thought..."
            className="flex-1 bg-transparent border-none outline-none px-6 text-lg text-white placeholder:text-white/10 font-medium"
          />
          <Button type="submit" disabled={!input.trim() || isTyping} className="w-14 h-14 rounded-full bg-[#E2FF6F] hover:bg-[#d4f056] text-black shadow-xl shadow-[#E2FF6F]/10 transition-all active:scale-90 disabled:bg-white/5 disabled:text-white/5">
            <Send className="w-6 h-6" />
          </Button>
        </form>
      </div>
    </div>
  );
}
