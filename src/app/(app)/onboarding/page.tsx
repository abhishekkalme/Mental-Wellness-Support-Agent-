"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  CheckCircle2, 
  Brain, 
  Moon, 
  Zap,
  Target,
  Heart,
  Activity,
  User,
  Coffee,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { subDays } from "date-fns";

const steps = [
  { id: "identity", title: "Identity" },
  { id: "baseline", title: "Baseline" },
  { id: "support", title: "Focus" },
  { id: "agent", title: "Agent" },
  { id: "generation", title: "Profile Generation" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const store = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [generationPhase, setGenerationPhase] = useState(0);
  
  const [formData, setFormData] = useState({
    name: store.name || "",
    stage: "",
    stressLevel: 3,
    energyLevel: 3,
    sleepQuality: 3,
    focusLevel: 3,
    overthinkingFrequency: "Sometimes",
    struggles: [] as string[],
    agentBehavior: "Listen first",
    checkInFrequency: "Daily",
  });

  const nextStep = () => {
    if (currentStep === 4) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const toggleStruggle = (s: string) => {
    setFormData(prev => ({
      ...prev,
      struggles: prev.struggles.includes(s) 
        ? prev.struggles.filter(x => x !== s) 
        : [...prev.struggles, s]
    }));
  };

  useEffect(() => {
    if (currentStep === 4) {
      let phase = 0;
      const interval = setInterval(() => {
        phase++;
        setGenerationPhase(phase);
        if (phase >= 6) {
          clearInterval(interval);
          completeOnboarding();
        }
      }, 700);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const completeOnboarding = () => {
    // 1. Core Profile
    store.setName(formData.name);
    store.setOnboardingData({
      stage: formData.stage,
      stressLevel: formData.stressLevel,
      energyLevel: formData.energyLevel,
      sleepQuality: formData.sleepQuality,
      focusLevel: formData.focusLevel,
      overthinkingFrequency: formData.overthinkingFrequency,
      struggles: formData.struggles,
      agentBehavior: formData.agentBehavior,
      checkInFrequency: formData.checkInFrequency,
      lastAssessmentDate: new Date().toISOString(),
    });

    // 2. Metrics Baseline
    const baseMental = 100 - (formData.stressLevel * 10) + (formData.focusLevel * 5);
    const basePhysical = formData.sleepQuality * 15 + formData.energyLevel * 5;
    const baseEmotional = formData.struggles.includes("Anxiety") ? 40 : 70;
    const baseSleep = formData.sleepQuality * 20;
    
    store.updateWellnessMetrics({
      mental: Math.max(30, Math.min(100, baseMental)),
      physical: Math.max(30, Math.min(100, basePhysical)),
      emotional: Math.max(30, Math.min(100, baseEmotional)),
      sleep: Math.max(30, Math.min(100, baseSleep)),
      social: formData.struggles.includes("Loneliness") ? 35 : 65,
      spiritual: 60
    });

    // 3. Habit Generation
    if (formData.struggles.includes("Sleep")) store.addHabit({ id: "h_sleep", name: "Wind Down Routine", frequency: "daily", streak: 0, completedDates: [] });
    if (formData.struggles.includes("Focus")) store.addHabit({ id: "h_focus", name: "Deep Work Session", frequency: "daily", streak: 0, completedDates: [] });
    if (formData.struggles.includes("Anxiety") || formData.overthinkingFrequency === "Often") store.addHabit({ id: "h_anx", name: "Box Breathing", frequency: "daily", streak: 0, completedDates: [] });
    if (store.habits.length === 0) store.addHabit({ id: "h_def", name: "Daily Hydration", frequency: "daily", streak: 0, completedDates: [] });

    // 4. Pre-populate Data (Simulated Historical Sleep Data)
    const baseHours = formData.sleepQuality <= 2 ? 5 : (formData.sleepQuality === 5 ? 8 : 6.5);
    for(let i = 1; i <= 3; i++) {
        store.addSleepEntry({
            id: `init_sleep_${i}`,
            date: subDays(new Date(), i).toISOString(),
            quality: formData.sleepQuality as 1|2|3|4|5,
            durationHours: baseHours + (Math.random() * 2 - 1)
        });
    }

    // 5. Intelligent First Chat Message
    let firstMessage = `Hi ${formData.name}, I'm here to support you. Let's get started.`;
    if (formData.struggles.includes("Sleep")) {
       firstMessage = `I noticed sleep is one of your priorities, ${formData.name}. How has your rest been lately?`;
    } else if (formData.struggles.includes("Anxiety")) {
       firstMessage = `When anxiety shows up for you, ${formData.name}, is it more physical, racing thoughts, or both?`;
    } else if (formData.struggles.includes("Focus")) {
       firstMessage = `What usually breaks your focus—phone, stress, or mental fatigue?`;
    } else if (formData.struggles.includes("Burnout")) {
       firstMessage = `Burnout can feel extremely heavy. Are you finding any moments to recharge, or does it feel endless?`;
    }
    
    // Clear chat history & inject
    store.addChatMessage({ id: `msg_init`, role: "assistant", content: firstMessage, timestamp: new Date().toISOString() });

    store.setOnboarded(true);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0A0D08] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-[#E2FF6F]/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full space-y-12 relative z-10">
        <div className="flex justify-between items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className={`h-2 rounded-full transition-all duration-700 flex-1 ${i <= currentStep ? "bg-[#E2FF6F] shadow-[0_0_10px_rgba(226,255,111,0.5)]" : "bg-white/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-panel p-12 rounded-[40px] bg-white/5 border border-white/5 shadow-2xl backdrop-blur-2xl space-y-10">
              <div>
                 <h2 className="text-4xl font-bold text-white mb-3">Operator Identity</h2>
                 <p className="text-white/40 font-medium text-lg">Define your signature in the system.</p>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.3em] pl-1">What should I call you?</label>
                 <input autoFocus type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-16 rounded-2xl bg-black/40 border border-white/10 px-6 text-xl text-white font-bold outline-none focus:border-[#E2FF6F] placeholder:text-white/20 transition-all" placeholder="Enter your name..." />
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-[#E2FF6F] uppercase tracking-[0.3em] pl-1">What stage are you in? (Optional)</label>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Student", i: GraduationCap },
                      { l: "Working professional", i: Briefcase },
                      { l: "Founder", i: Zap },
                      { l: "Parent", i: Heart },
                      { l: "Other", i: User }
                    ].map(st => (
                      <button key={st.l} onClick={() => setFormData({...formData, stage: st.l})} className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.stage === st.l ? "bg-[#E2FF6F] border-[#E2FF6F] text-black" : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"}`}>
                        <st.i className="w-4 h-4" /> {st.l}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button className="h-16 px-10 bg-[#E2FF6F] text-black font-bold uppercase tracking-widest rounded-2xl shadow-xl hover:bg-[#d4f056] disabled:opacity-50" disabled={!formData.name.trim()} onClick={nextStep}>Continue</Button>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-panel p-12 rounded-[40px] bg-white/5 border border-white/5 shadow-2xl backdrop-blur-2xl space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Emotional Baseline</h2>
                <p className="text-white/40 font-medium">How have you felt lately?</p>
              </div>
              <div className="space-y-8 py-2">
                 {[
                   { label: "Stress", key: "stressLevel" },
                   { label: "Energy", key: "energyLevel" },
                   { label: "Sleep", key: "sleepQuality" },
                   { label: "Focus", key: "focusLevel" },
                 ].map(metric => (
                   <div key={metric.key} className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-xs font-bold uppercase tracking-widest text-white/60">{metric.label}</label>
                         <span className="text-[#E2FF6F] font-bold text-lg">{(formData as any)[metric.key]}<span className="text-xs text-white/40">/5</span></span>
                      </div>
                      <input type="range" min="1" max="5" value={(formData as any)[metric.key]} onChange={e => setFormData({...formData, [metric.key]: parseInt(e.target.value)})} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E2FF6F]" />
                   </div>
                 ))}
                 <div className="space-y-4 pt-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/60 px-1 mb-2 block">Do you often overthink?</label>
                    <div className="grid grid-cols-3 gap-2">
                       {["Rarely", "Sometimes", "Often"].map(f => (
                         <button key={f} onClick={() => setFormData({...formData, overthinkingFrequency: f})} className={`p-4 rounded-xl text-sm font-bold border transition-all ${formData.overthinkingFrequency === f ? "bg-[#E2FF6F] border-[#E2FF6F] text-black" : "bg-black/30 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}>
                           {f}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="pt-2 flex gap-4">
                <Button variant="ghost" className="flex-1 h-16 text-white/40 font-bold uppercase tracking-widest bg-white/5 rounded-2xl hover:text-white" onClick={prevStep}>Back</Button>
                <Button className="flex-[2] h-16 bg-[#E2FF6F] text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-[#d4f056]" onClick={nextStep}>Next</Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-panel p-10 rounded-[40px] bg-white/5 border border-white/5 shadow-2xl backdrop-blur-2xl space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Main Support Areas</h2>
                <p className="text-white/40 font-medium">What do you want help with most?</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                 {[
                   { label: "Anxiety", icon: Heart },
                   { label: "Sleep", icon: Moon },
                   { label: "Focus", icon: Brain },
                   { label: "Motivation", icon: Target },
                   { label: "Loneliness", icon: User },
                   { label: "Burnout", icon: Zap },
                   { label: "Overthinking", icon: Activity },
                   { label: "Emotional balance", icon: Sparkles }
                 ].map(s => (
                   <button key={s.label} onClick={() => toggleStruggle(s.label)} className={`p-4 rounded-[20px] border transition-all flex flex-col items-center text-center gap-2 group ${formData.struggles.includes(s.label) ? "bg-[#E2FF6F]/10 border-[#E2FF6F]/50 shadow-[0_0_15px_rgba(226,255,111,0.1)]" : "bg-black/30 border-white/5 hover:bg-white/5"}`}>
                     <s.icon className={`w-5 h-5 ${formData.struggles.includes(s.label) ? "text-[#E2FF6F]" : "text-white/40"} mb-1 group-hover:scale-110 transition-transform`} />
                     <span className={`font-bold text-xs ${formData.struggles.includes(s.label) ? "text-[#E2FF6F]" : "text-white/60"}`}>{s.label}</span>
                   </button>
                 ))}
              </div>
              <div className="pt-4 flex gap-4">
                <Button variant="ghost" className="flex-1 h-16 text-white/40 font-bold uppercase tracking-widest bg-white/5 rounded-2xl hover:text-white" onClick={prevStep}>Back</Button>
                <Button className="flex-[2] h-16 bg-[#E2FF6F] text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-[#d4f056]" onClick={nextStep}>Next</Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-panel p-10 rounded-[40px] bg-white/5 border border-white/5 shadow-2xl backdrop-blur-2xl space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">Agent Behavior</h2>
                <p className="text-white/40 font-medium">How should your AI companion support you?</p>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-2">
                    {[
                      "Listen first", "Give practical advice", "Help organize thoughts", "Motivate me", "Challenge negative thinking"
                    ].map(bh => (
                      <button key={bh} onClick={() => setFormData({...formData, agentBehavior: bh})} className={`p-4 rounded-2xl text-sm font-bold border flex items-center justify-between transition-all ${formData.agentBehavior === bh ? "bg-[#E2FF6F]/10 border-[#E2FF6F]/50 text-[#E2FF6F]" : "bg-black/30 border-white/5 text-white/50 hover:bg-white/5 hover:text-white"}`}>
                        {bh} {formData.agentBehavior === bh && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-4 pt-4">
                 <label className="text-xs font-bold uppercase tracking-widest text-white/60 px-1 mb-2 block">How often should I check in?</label>
                 <div className="grid grid-cols-3 gap-2">
                    {["Daily", "Twice a day", "Only when open"].map(f => (
                      <button key={f} onClick={() => setFormData({...formData, checkInFrequency: f})} className={`p-3 rounded-xl text-xs font-bold border transition-all ${formData.checkInFrequency === f ? "bg-[#E2FF6F] border-[#E2FF6F] text-black" : "bg-black/30 border-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}>
                        {f}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="pt-4 flex gap-4">
                <Button variant="ghost" className="flex-1 h-16 text-white/40 font-bold uppercase tracking-widest bg-white/5 rounded-2xl hover:text-white" onClick={prevStep}>Back</Button>
                <Button className="flex-[2] h-16 bg-[#E2FF6F] text-black font-bold uppercase tracking-widest rounded-2xl hover:bg-[#d4f056]" onClick={nextStep}>Finalize</Button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-12 rounded-[40px] bg-[#E2FF6F]/5 border border-[#E2FF6F]/20 shadow-2xl backdrop-blur-2xl text-center space-y-10">
              <div className="w-24 h-24 bg-[#E2FF6F]/10 rounded-full flex items-center justify-center text-[#E2FF6F] mx-auto shadow-[0_0_30px_rgba(226,255,111,0.2)]">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                 <h2 className="text-4xl font-black text-white tracking-tight mb-2">Profile Activated</h2>
                 <p className="text-white/50 text-lg font-medium">Generating your custom ecosystem...</p>
              </div>
              <div className="space-y-4 max-w-sm mx-auto text-left py-4">
                {[
                  { p: 1, t: "Mood Check-ins initialized" },
                  { p: 2, t: "Personalized rituals created" },
                  { p: 3, t: "AI companion calibrated" },
                  { p: 4, t: "Emergency support enabled" },
                  { p: 5, t: "Insight engine connected" },
                ].map(item => (
                   <div key={item.p} className={`flex items-center gap-3 transition-all duration-500 ${generationPhase >= item.p ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                      <CheckCircle2 className="w-5 h-5 text-[#E2FF6F]" />
                      <span className="font-bold text-white/80">{item.t}</span>
                   </div>
                ))}
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-8">
                 <motion.div className="h-full bg-[#E2FF6F] shadow-[0_0_10px_rgba(226,255,111,0.5)]" initial={{ width: "0%" }} animate={{ width: `${(generationPhase / 5) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
