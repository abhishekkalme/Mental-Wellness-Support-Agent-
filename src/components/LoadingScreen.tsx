'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0C0B]">
      <div className="relative">
        {/* Outer Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-[#E2FF6F] blur-2xl rounded-full"
        />

        {/* Main Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-[#E2FF6F]/10 rounded-full" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 border-4 border-t-[#E2FF6F] rounded-full"
          />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-[#E2FF6F] text-xs font-bold uppercase tracking-[0.3em]"
      >
        MindCare Initializing
      </motion.p>
    </div>
  );
}
