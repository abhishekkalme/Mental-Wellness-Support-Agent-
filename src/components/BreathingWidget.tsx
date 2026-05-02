"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Wind, Pause } from "lucide-react";
import { Button } from "./ui/button";

const phases = [
  {
    name: "Inhale",
    duration: 4000,
    scale: 1.15,
    progress: 33,
  },
  {
    name: "Hold",
    duration: 4000,
    scale: 1.15,
    progress: 66,
  },
  {
    name: "Exhale",
    duration: 4000,
    scale: 1,
    progress: 100,
  },
] as const;

type Phase = (typeof phases)[number];

export function BreathingWidget() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const phase: Phase = phases[phaseIndex];

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, phase.duration);

    return () => clearTimeout(timer);
  }, [phase, isActive]);

  const toggleSession = () => {
    if (!isActive) {
      setPhaseIndex(0);
    }

    setIsActive((prev) => !prev);
  };

  // SVG ring sizing
  const size = 300;
  const center = size / 2;
  const radius = 130;
  const strokeWidth = 4;

  const circumference = 2 * Math.PI * radius;

  return (
    <div className="glass-panel p-10 flex flex-col items-center gap-10 min-h-[580px] relative overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#E2FF6F]/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="text-center relative z-10">
        <h3 className="text-3xl font-bold tracking-tight text-white">
          Take a deep breath
        </h3>

        <p className="text-white/40 mt-2 font-medium">
          Calm your nervous system
        </p>
      </div>

      {/* Breathing Orb */}
      <div className="relative w-72 h-72 flex items-center justify-center overflow-visible">

        {/* Progress Ring */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 w-full h-full -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Animated ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E2FF6F"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset:
                circumference -
                (circumference *
                  (isActive ? phase.progress : 0)) /
                  100,
            }}
            transition={{
              duration: phase.duration / 1000,
              ease: "linear",
            }}
            className="drop-shadow-[0_0_14px_rgba(226,255,111,0.45)]"
          />
        </svg>

        {/* Orb */}
        <motion.div
          animate={{
            scale: isActive ? phase.scale : 1,
          }}
          transition={{
            duration: phase.duration / 1000,
            ease:
              phase.name === "Inhale"
                ? "easeOut"
                : phase.name === "Exhale"
                ? "easeIn"
                : "linear",
          }}
          className="relative w-56 h-56 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl overflow-hidden"
        >

          {/* Internal glow */}
          <motion.div
            animate={{
              scale: isActive ? phase.scale : 1,
              opacity: isActive ? 0.35 : 0.15,
            }}
            transition={{
              duration: phase.duration / 1000,
            }}
            className="absolute inset-0 bg-[#E2FF6F]/20 blur-3xl"
          />

          {/* Character */}
          <Image
            src="/assets/images/meditating-character.png"
            alt="Meditation"
            fill
            className="object-contain p-8 relative z-10"
          />
        </motion.div>
      </div>

      {/* Text */}
      <div className="text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isActive ? phase.name : "idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-3xl font-bold text-white h-10"
          >
            {isActive
              ? `${phase.name}...`
              : "Ready to focus?"}
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">
          4s IN • 4s HOLD • 4s OUT
        </p>
      </div>

      {/* Action button */}
      <Button
        onClick={toggleSession}
        className="w-full h-16 rounded-[24px] bg-[#E2FF6F] hover:bg-[#d8f55b] text-black font-bold text-lg gap-3 shadow-xl shadow-[#E2FF6F]/10 active:scale-[0.98]"
      >
        {isActive ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Wind className="w-5 h-5" />
        )}

        {isActive
          ? "Pause Session"
          : "Start Breathing"}
      </Button>
    </div>
  );
}