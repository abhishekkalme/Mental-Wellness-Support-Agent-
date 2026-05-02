"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Wind, 
  ShieldCheck, 
  ArrowLeft, 
  Flame, 
  Infinity, 
  Scale,
  Frown,
  Heart
} from "lucide-react";
import Link from "next/link";

type RescueModule = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  steps: { text: string; sub: string }[];
};

const rescueModules: RescueModule[] = [
  {
    id: "anxiety",
    title: "Panic & Anxiety",
    description: "Centering yourself when things feel out of control.",
    icon: Wind,
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
    steps: [
      { text: "Acknowledge the feeling", sub: "Say to yourself: 'I am feeling anxious, and that's okay. It will pass.'" },
      { text: "The 3-3-3 Rule", sub: "Name 3 things you see, 3 things you hear, and move 3 parts of your body." },
      { text: "Rooting", sub: "Feel your feet pressing into the floor. Imagine roots growing into the earth." },
      { text: "Gentle Breath", sub: "Take a slow breath in for 4, hold for 1, and exhale for 8." }
    ]
  },
  {
    id: "anger",
    title: "Anger & Frustration",
    description: "Cooling down the heat of the moment.",
    icon: Flame,
    color: "text-rose-500",
    gradient: "from-rose-500/20 to-orange-500/20",
    steps: [
      { text: "Pause", sub: "Take your hands off whatever you're doing. Close your eyes for 5 seconds." },
      { text: "Scan the heat", sub: "Where is the anger in your body? Jaw? Chest? Hands? Soften that area." },
      { text: "The Perspective Shift", sub: "Will this matter in 5 days? 5 months? 5 years?" },
      { text: "Release", sub: "Exhale sharply, like you're blowing out a candle from across the room." }
    ]
  },
  {
    id: "burnout",
    title: "Emotional Burnout",
    description: "When you feel like you have nothing left to give.",
    icon: Infinity,
    color: "text-amber-500",
    gradient: "from-amber-500/20 to-yellow-500/20",
    steps: [
      { text: "Total Permission", sub: "Give yourself permission to do absolutely nothing for the next 5 minutes." },
      { text: "Lower the Bar", sub: "Internalize this: 'I am enough, even if I accomplish nothing more today.'" },
      { text: "Sensory Comfort", sub: "Touch something soft or drink a sip of water. Reconnect with your basic needs." },
      { text: "Micro-rest", sub: "Lean back, let your shoulders drop, and just exist in this space." }
    ]
  },
  {
    id: "regret",
    title: "Regret & Guilt",
    description: "Releasing the weight of the past.",
    icon: Scale,
    color: "text-indigo-500",
    gradient: "from-indigo-500/20 to-purple-500/20",
    steps: [
      { text: "Acknowledge the Lesson", sub: "What did this situation teach you? Take the lesson, leave the weight." },
      { text: "Compassion Check", sub: "Would you judge a friend this harshly? Offer yourself the same grace." },
      { text: "The Now", sub: "The past is a memory. Your only power is in this exact moment." },
      { text: "Forgiveness Affirmation", sub: "Quietly say: 'I did the best I could with what I knew then. I release this now.'" }
    ]
  }
];

export default function RescuePage() {
  const [activeModule, setActiveModule] = useState<RescueModule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const startModule = (v: RescueModule) => {
    setActiveModule(v);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (!activeModule) return;
    if (currentStep < activeModule.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setActiveModule(null);
    }
  };

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-12">
      <AnimatePresence mode="wait">
        {!activeModule ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10"
          >
            <header className="text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Rescue Sessions</h1>
              <p className="text-muted-foreground text-lg italic">
                "In the middle of difficulty lies opportunity." — Choose a session for immediate relief.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rescueModules.map((m) => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startModule(m)}
                  className={`glass-panel p-8 text-left border-2 border-transparent hover:border-primary/20 transition-all flex flex-col gap-6 group relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className={`p-4 rounded-2xl bg-background shadow-sm ${m.color}`}>
                      <m.icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-bold">{m.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{m.description}</p>
                  </div>

                  <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-primary relative z-10">
                    Start Relief Session <ShieldCheck className="w-4 h-4 ml-1" />
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="text-center">
               <Link href="/crisis">
                 <Button variant="outline" className="gap-2">
                   <ShieldCheck className="w-4 h-4" /> Need Professional Help?
                 </Button>
               </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="module"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`min-h-[60vh] glass-panel p-8 md:p-16 flex flex-col items-center justify-center text-center relative overflow-hidden`}
          >
             <div className={`absolute inset-0 bg-gradient-to-br ${activeModule.gradient} opacity-40`} />
             
             <button 
               onClick={() => setActiveModule(null)}
               className="absolute top-8 left-8 p-2 hover:bg-background/50 rounded-full transition-colors z-20"
             >
               <ArrowLeft className="w-6 h-6" />
             </button>

             <motion.div 
               className="relative z-10 w-full max-w-2xl space-y-12"
             >
                <div className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {activeModule.steps.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentStep ? "bg-primary w-8" : "bg-primary/10 w-4"}`} />
                    ))}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Step {currentStep + 1} of {activeModule.steps.length}</p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{activeModule.steps[currentStep].text}</h2>
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
                      {activeModule.steps[currentStep].sub}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-8">
                  <Button 
                    size="lg" 
                    className="h-16 px-12 text-lg rounded-2xl shadow-xl shadow-primary/20"
                    onClick={nextStep}
                  >
                    {currentStep === activeModule.steps.length - 1 ? "Complete Session" : "Continue"}
                  </Button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
