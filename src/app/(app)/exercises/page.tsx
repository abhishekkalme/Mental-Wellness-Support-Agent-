"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wind, Fingerprint } from "lucide-react";

export default function ExercisesPage() {
  const [activeExercise, setActiveExercise] = useState<"breathing" | "grounding" | null>(null);

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-8 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Wellness Exercises</h1>
        <p className="text-muted-foreground mt-1">Tools to help you recenter and find calm.</p>
      </header>

      {!activeExercise && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div 
            onClick={() => setActiveExercise("breathing")}
            className="glass-panel p-8 rounded-2xl cursor-pointer hover:border-primary/50 transition-all border border-border group relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wind className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold">4-7-8 Breathing</h3>
            <p className="text-muted-foreground mt-2">A proven technique to reduce anxiety and help you relax or sleep.</p>
          </div>

          <div 
            onClick={() => setActiveExercise("grounding")}
            className="glass-panel p-8 rounded-2xl cursor-pointer hover:border-primary/50 transition-all border border-border group relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold">5-4-3-2-1 Grounding</h3>
            <p className="text-muted-foreground mt-2">Engage your senses to quickly anchor yourself in the present moment.</p>
          </div>
        </div>
      )}

      {activeExercise === "breathing" && (
        <BreathingExercise onComplete={() => setActiveExercise(null)} />
      )}
      {activeExercise === "grounding" && (
        <GroundingExercise onComplete={() => setActiveExercise(null)} />
      )}
    </main>
  );
}

function BreathingExercise({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    
    let timer: NodeJS.Timeout;
    if (phase === "inhale") {
      timer = setTimeout(() => setPhase("hold"), 4000);
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("exhale"), 7000);
    } else if (phase === "exhale") {
      timer = setTimeout(() => setPhase("inhale"), 8000);
    }

    return () => clearTimeout(timer);
  }, [phase, playing]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          animate={
            !playing ? { scale: 1, opacity: 0.5 } :
            phase === "inhale" ? { scale: 2, opacity: 1, backgroundColor: "var(--color-primary)" } :
            phase === "hold" ? { scale: 2, opacity: 0.8, backgroundColor: "var(--color-primary)" } :
            { scale: 1, opacity: 0.5, backgroundColor: "var(--color-secondary)" }
          }
          transition={{
            duration: phase === "inhale" ? 4 : phase === "hold" ? 7 : 8,
            ease: "linear",
          }}
          className="absolute w-32 h-32 rounded-full blur-[2px]"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div className="z-10 relative text-2xl font-semibold tracking-wide text-foreground font-mono glass-panel px-4 py-2 rounded-full">
          {!playing ? "Ready" : phase.toUpperCase()}
        </div>
      </div>
      
      <div className="mt-16 space-x-4">
        <Button onClick={() => setPlaying(!playing)} size="lg">
          {playing ? "Pause" : "Start Exercise"}
        </Button>
        <Button variant="outline" onClick={onComplete} size="lg">Return</Button>
      </div>
    </div>
  );
}

function GroundingExercise({ onComplete }: { onComplete: () => void }) {
  const steps = [
    { num: 5, action: "Acknowledge 5 things you can see around you." },
    { num: 4, action: "Acknowledge 4 things you can physically feel." },
    { num: 3, action: "Acknowledge 3 things you can hear." },
    { num: 2, action: "Acknowledge 2 things you can smell." },
    { num: 1, action: "Acknowledge 1 good thing about yourself." },
  ];
  
  const [step, setStep] = useState(0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-12 w-full space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary text-2xl font-bold flex items-center justify-center mx-auto">
          {steps[step].num}
        </div>
        <h2 className="text-2xl font-semibold">{steps[step].action}</h2>
        <p className="text-muted-foreground text-sm">Take your time. Take a deep breath.</p>
        
        <div className="pt-8">
          {step < 4 ? (
            <Button size="lg" onClick={() => setStep(s => s + 1)}>Next Step</Button>
          ) : (
            <Button size="lg" onClick={onComplete}>Complete</Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
