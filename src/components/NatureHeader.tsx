"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function NatureHeader({ name = "Alex" }: { name?: string }) {
  return (
    <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden rounded-[32px] md:rounded-[48px] mb-8 md:mb-12 group">
      {/* Background Image with Ken Burns effect */}
      <motion.div 
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0"
      >
        <Image
          src="/assets/images/forest-bg.png"
          alt="Zen Nature"
          fill
          className="object-cover brightness-[0.7] contrast-[1.1]"
          priority
        />
      </motion.div>
      
      {/* Dynamic atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0B] via-transparent to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 text-white pb-10 md:pb-20">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
           className="space-y-6 max-w-2xl"
        >
          <div className="flex items-center gap-3">
             <span className="w-12 h-[2px] bg-[#E2FF6F]" />
             <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#E2FF6F]">MindCare AI • Secure Space</p>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1] md:leading-[0.95] text-white drop-shadow-2xl mt-4 md:mt-0">
            Focus on your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">inner peace.</span>
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="glass-panel px-4 py-3 md:px-6 md:py-3 border-[#E2FF6F]/20 flex items-center gap-3 w-fit">
                <div className="w-2 h-2 rounded-full bg-[#E2FF6F] animate-pulse" />
                <span className="text-xs md:text-sm font-bold">Good morning, {name}</span>
            </div>
            <p className="text-sm md:text-lg text-white/50 font-medium">
              Take a deep breath and settle in.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Dust Particles (Css only) */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
         <div className="absolute w-[2px] h-[2px] bg-white rounded-full left-[20%] top-[40%] animate-ping" />
         <div className="absolute w-[1px] h-[1px] bg-white rounded-full left-[60%] top-[70%] animate-pulse" />
      </div>
    </div>
  );
}
