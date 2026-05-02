"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export function QuoteCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden group rounded-[48px] p-12 min-h-[450px] bg-white/5 border border-white/10 flex flex-col justify-center gap-8 shadow-2xl backdrop-blur-3xl"
    >
      {/* Decorative leaf/plant background */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000">
        <svg viewBox="0 0 200 200" className="w-80 h-80 text-[#E2FF6F]" fill="currentColor">
          <path d="M100 0 C150 50 150 150 100 200 C50 150 50 50 100 0" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 p-8 opacity-5 -rotate-45">
        <svg viewBox="0 0 200 200" className="w-64 h-64 text-[#E2FF6F]" fill="currentColor">
          <path d="M100 0 C150 50 150 150 100 200 C50 150 50 50 100 0" />
        </svg>
      </div>

      <div className="w-16 h-16 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center relative z-10 mb-4">
        <Quote className="w-8 h-8 text-[#E2FF6F]/40" />
      </div>
      
      <h2 className="text-4xl font-bold tracking-tight text-white leading-[1.1] z-10 drop-shadow-2xl">
        "Nature does not hurry, <br />
        <span className="text-[#E2FF6F]">yet everything is accomplished.</span>"
      </h2>
      
      <div className="flex items-center gap-4 z-10">
        <div className="w-12 h-[2px] bg-[#E2FF6F]" />
        <span className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Lao Tzu</span>
      </div>
    </motion.div>
  );
}
