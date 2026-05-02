"use client";

import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import Image from "next/image";

export function AIChatBar() {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mt-12 glass-panel p-8 flex items-center gap-10 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#E2FF6F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative w-24 h-24 bg-white/5 rounded-full p-2 border border-white/10 flex-shrink-0 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-[#E2FF6F]/10 blur-2xl rounded-full animate-pulse-slow" />
        <Image 
          src="/assets/images/meditating-character.png" 
          alt="MindCare Bot" 
          fill
          className="object-contain p-4 grayscale brightness-150 group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E2FF6F] rounded-full border-4 border-[#0A0C0B] shadow-[0_0_15px_rgba(226,255,111,0.5)]" />
      </div>

      <div className="flex-1 space-y-6 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold tracking-tight text-white">Hi Alex 👋</span>
          <span className="text-white/40 font-medium text-sm tracking-wide">I'm here to listen. What's on your mind today?</span>
        </div>
        
        <div className="relative flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Share anything..."
            className="w-full h-16 bg-white/5 border border-white/5 rounded-[24px] px-8 pr-16 text-lg font-medium focus:ring-2 focus:ring-[#E2FF6F]/30 focus:border-[#E2FF6F]/20 focus:bg-white/10 placeholder:text-white/20 transition-all duration-500 outline-none text-white"
          />
          <button className="absolute right-3 w-12 h-12 bg-[#E2FF6F] text-black rounded-[18px] flex items-center justify-center hover:bg-[#d4f056] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#E2FF6F]/20">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
