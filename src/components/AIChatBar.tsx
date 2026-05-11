'use client';

import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { LiveRegion } from '@/lib/accessibility';

export function AIChatBar() {
  const [message, setMessage] = useState('');
  const [announcement, setAnnouncement] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    setAnnouncement('Message sent: ' + message);
    setMessage('');
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return (
    <>
      <LiveRegion message={announcement} level="polite" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mt-6 md:mt-12 glass-panel p-4 md:p-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-10 shadow-2xl relative overflow-hidden group"
        role="complementary"
        aria-label="AI Chat Assistant"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#E2FF6F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full p-2 border border-white/10 flex-shrink-0 backdrop-blur-3xl hidden md:block">
          <div className="absolute inset-0 bg-[#E2FF6F]/10 blur-2xl rounded-full animate-pulse-slow" />
          <Image
            src="/assets/images/meditating-character.png"
            alt="MindCare Bot"
            fill
            className="object-contain p-4 grayscale brightness-150 group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E2FF6F] rounded-full border-4 border-[#0A0C0B] shadow-[0_0_15px_rgba(226,255,111,0.5)]" />
        </div>

        <div className="flex-1 space-y-4 md:space-y-6 relative z-10 w-full">
          <div className="flex flex-col gap-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">Hi Alex</span>
            <span className="text-white/40 font-medium text-xs md:text-sm tracking-wide">
              I&apos;m here to listen. What&apos;s on your mind today?
            </span>
          </div>

          <div className="relative flex items-center gap-4">
            <input
              type="text"
              placeholder="Share anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              aria-label="Chat message input"
              aria-describedby="chat-hint"
              className="w-full h-12 md:h-16 bg-white/5 border border-white/5 rounded-[24px] px-6 md:px-8 pr-14 md:pr-16 text-base md:text-lg font-medium focus:ring-2 focus:ring-[#E2FF6F]/30 focus:border-[#E2FF6F]/20 focus:bg-white/10 placeholder:text-white/20 transition-all duration-500 outline-none text-white"
            />
            <span id="chat-hint" className="sr-only">
              Press Enter to send your message
            </span>
            <button
              onClick={handleSend}
              aria-label="Send chat message"
              className="absolute right-2 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-[#E2FF6F] text-black rounded-[18px] flex items-center justify-center hover:bg-[#d4f056] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#E2FF6F]/20"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
