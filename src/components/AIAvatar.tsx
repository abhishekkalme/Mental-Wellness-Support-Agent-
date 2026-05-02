"use client";

import { motion } from "framer-motion";

export function AIAvatar() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        {/* Breathing Orb */}
        <motion.div
           animate={{
             scale: [1, 1.15, 0.95, 1.1, 1],
             opacity: [0.4, 0.7, 0.4, 0.6, 0.4],
             borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 20% 80% / 25% 80% 20% 75%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
           }}
           transition={{
             duration: 6,
             repeat: Infinity,
             ease: "easeInOut",
           }}
           className="w-14 h-14 bg-primary blur-xl absolute -inset-1 opacity-50"
        />
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-lg relative z-10 overflow-hidden">
           <motion.svg
             viewBox="0 0 24 24"
             className="w-6 h-6"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
           >
             <motion.path
               d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"
               initial={{ pathLength: 0, opacity: 0 }}
               animate={{ pathLength: 1, opacity: 1 }}
               transition={{ 
                 duration: 2, 
                 repeat: Infinity, 
                 repeatType: "reverse",
                 ease: "easeInOut" 
               }}
             />
             <motion.circle 
               cx="12" cy="12" r="3"
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.5, 1, 0.5]
               }}
               transition={{ duration: 3, repeat: Infinity }}
             />
           </motion.svg>
        </div>
      </div>
      <div>
        <h3 className="font-medium text-lg leading-none">MindCare</h3>
        <p className="text-xs text-muted-foreground mt-1">Your gentle companion</p>
      </div>
    </div>
  );
}
