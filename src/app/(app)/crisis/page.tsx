'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  PhoneCall,
  ShieldAlert,
  ArrowLeft,
  UserPlus,
  Wind,
  Plus,
  Send,
  MapPin,
  X,
  AlertOctagon,
  Phone,
  Zap,
  Flame,
  Infinity,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface PersonalContact {
  _id?: string;
  name: string;
  phone: string;
  relation: string;
  isTrustedAlert: boolean;
}

interface SafetyPlan {
  warningSigns: string;
  copingStrategies: string;
  reasonsToLive: string;
  safePlaces: string;
}

interface RescueModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  steps: { text: string; sub: string }[];
}

const rescueModules: RescueModule[] = [
  {
    id: 'anxiety',
    title: 'Panic & Anxiety',
    description: 'Centering yourself when things feel out of control.',
    icon: Wind,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    steps: [
      { text: 'Acknowledge the feeling', sub: "Say to yourself: 'I am feeling anxious, and that's okay. It will pass.'" },
      { text: 'The 3-3-3 Rule', sub: 'Name 3 things you see, 3 things you hear, and move 3 parts of your body.' },
      { text: 'Rooting', sub: 'Feel your feet pressing into the floor. Imagine roots growing into the earth.' },
      { text: 'Gentle Breath', sub: 'Take a slow breath in for 4, hold for 1, and exhale for 8.' },
    ],
  },
  {
    id: 'anger',
    title: 'Anger & Frustration',
    description: 'Cooling down the heat of the moment.',
    icon: Flame,
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-orange-500/20',
    steps: [
      { text: 'Pause', sub: "Take your hands off whatever you're doing. Close your eyes for 5 seconds." },
      { text: 'Scan the heat', sub: 'Where is the anger in your body? Jaw? Chest? Hands? Soften that area.' },
      { text: 'The Perspective Shift', sub: 'Will this matter in 5 days? 5 months? 5 years?' },
      { text: 'Release', sub: "Exhale sharply, like you're blowing out a candle from across the room." },
    ],
  },
  {
    id: 'burnout',
    title: 'Emotional Burnout',
    description: 'When you feel like you have nothing left to give.',
    icon: Infinity,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    steps: [
      { text: 'Total Permission', sub: 'Give yourself permission to do absolutely nothing for the next 5 minutes.' },
      { text: 'Lower the Bar', sub: "Internalize this: 'I am enough, even if I accomplish nothing more today.'" },
      { text: 'Sensory Comfort', sub: 'Touch something soft or drink a sip of water. Reconnect with your basic needs.' },
      { text: 'Micro-rest', sub: 'Lean back, let your shoulders drop, and just exist in this space.' },
    ],
  },
  {
    id: 'regret',
    title: 'Regret & Guilt',
    description: 'Releasing the weight of the past.',
    icon: Scale,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    steps: [
      { text: 'Acknowledge the Lesson', sub: 'What did this situation teach you? Take the lesson, leave the weight.' },
      { text: 'Compassion Check', sub: 'Would you judge a friend this harshly? Offer yourself the same grace.' },
      { text: 'The Now', sub: 'The past is a memory. Your only power is in this exact moment.' },
      { text: 'Forgiveness Affirmation', sub: "Quietly say: 'I did the best I could with what I knew then. I release this now.'" },
    ],
  },
];

const DEFAULT_SAFETY_PLAN: SafetyPlan = {
  warningSigns: '',
  copingStrategies: '',
  reasonsToLive: '',
  safePlaces: '',
};

export default function CrisisPage() {
  const { data: session, status } = useSession();
  
  const [personalContacts, setPersonalContacts] = useState<PersonalContact[]>([]);
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>(DEFAULT_SAFETY_PLAN);
  const [dbLoading, setDbLoading] = useState(true);

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertContact, setSelectedAlertContact] = useState<PersonalContact | null>(null);

  const [userLocationStr, setUserLocationStr] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

  const [activeModule, setActiveModule] = useState<RescueModule | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }
    setLocationStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocationCoords({ lat, lng });
        setUserLocationStr(`https://www.google.com/maps?q=${lat},${lng}`);
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/login';
      return;
    }
    
    if (status === 'authenticated') {
      const initData = async () => {
        try {
          const profileRes = await fetch('/api/crisis/profile');
          if (profileRes.ok) {
            const profile = await profileRes.json();
            if (profile.safetyPlan) setSafetyPlan(profile.safetyPlan);
            if (profile.emergencyContacts) setPersonalContacts(profile.emergencyContacts);
          }
        } catch (err) {
          console.error("Failed to load crisis data", err);
        } finally {
          setDbLoading(false);
        }
      };
      initData();
      fetchLocation();
    }
  }, [status]);

  const saveCrisisProfile = async (newContacts = personalContacts, newPlan = safetyPlan) => {
    try {
      await fetch('/api/crisis/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyContacts: newContacts, safetyPlan: newPlan })
      });
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const handleSafetyPlanChange = (key: keyof SafetyPlan, value: string) => {
     setSafetyPlan(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSafetyPlanBlur = () => saveCrisisProfile(personalContacts, safetyPlan);

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) return;
    const newContact: PersonalContact = {
      name: newContactName,
      phone: newContactPhone,
      relation: 'Trusted',
      isTrustedAlert: true
    };
    const updatedContacts = [...personalContacts, newContact];
    setPersonalContacts(updatedContacts);
    saveCrisisProfile(updatedContacts, safetyPlan);
    setNewContactName('');
    setNewContactPhone('');
    setIsAddingContact(false);
  };

  const handleRemoveContact = (index: number) => {
    const updated = [...personalContacts];
    updated.splice(index, 1);
    setPersonalContacts(updated);
    saveCrisisProfile(updated, safetyPlan);
  };

  useEffect(() => {
    if (!isBreathingActive) {
      setBreathingPhase('idle');
      setTimeLeft(0);
      return;
    }
    
    let timer: NodeJS.Timeout;
    if (breathingPhase === 'idle' || breathingPhase === 'exhale') {
      setBreathingPhase('inhale');
      setTimeLeft(4);
      timer = setTimeout(() => setBreathingPhase('hold'), 4000);
    } else if (breathingPhase === 'inhale') {
      setTimeLeft(7);
      timer = setTimeout(() => setBreathingPhase('exhale'), 7000);
    } else if (breathingPhase === 'hold') {
      setTimeLeft(8);
      timer = setTimeout(() => setBreathingPhase('inhale'), 8000);
    }
    return () => clearTimeout(timer);
  }, [breathingPhase, isBreathingActive]);

  useEffect(() => {
    if (timeLeft > 0 && isBreathingActive) {
      const countdown = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timeLeft, isBreathingActive]);

  const handleMapsDirect = () => {
     if (locationCoords) {
       window.open(`https://www.google.com/maps/search/emergency+hospital/@${locationCoords.lat},${locationCoords.lng},14z`, '_blank');
     } else {
       window.open(`https://www.google.com/maps/search/nearest+hospital+emergency/`, '_blank');
     }
  };
  
  const sendAlert = (contact: PersonalContact, channel: 'whatsapp' | 'sms') => {
     const textBody = encodeURIComponent(`🚨 EMERGENCY ALERT: I may need help right now.\n\nTime: ${new Date().toLocaleTimeString()}\nLocation: ${userLocationStr || 'Location unavailable'}\n\nPlease check in on me immediately.`);
     const cleanPhone = contact.phone.replace(/\D/g, '');
     if (channel === 'whatsapp') {
       window.open(`https://wa.me/${cleanPhone}?text=${textBody}`, '_blank');
     } else {
       window.location.href = `sms:${contact.phone}?body=${textBody}`;
     }
     setIsAlertModalOpen(false);
     setSelectedAlertContact(null);
  };

  const openAlertModal = () => {
    if (personalContacts.length === 0) {
      alert('Please add a trusted contact first.');
      document.getElementById('contacts-section')?.scrollIntoView({ behavior: 'smooth' });
      setIsAddingContact(true);
      return;
    }
    setSelectedAlertContact(personalContacts[0]);
    setIsAlertModalOpen(true);
  };

  const startModule = (m: RescueModule) => {
    setActiveModule(m);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (!activeModule) return;
    if (currentStep < activeModule.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setActiveModule(null);
      setCurrentStep(0);
    }
  };

  if (status === 'loading' || dbLoading) {
    return <div className="min-h-screen bg-[#0A0C0B] flex items-center justify-center text-white/40 font-bold">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-[#0A0C0B] text-white pb-24 selection:bg-white/10">
      <AnimatePresence mode="wait">
        {activeModule ? (
          <motion.div
            key="module"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${activeModule.gradient} opacity-30`} />
            
            <button
              onClick={() => setActiveModule(null)}
              className="absolute top-6 left-6 p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-20"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <motion.div className="relative z-10 w-full max-w-2xl space-y-10 text-center px-4">
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  {activeModule.steps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-[#E2FF6F] w-8' : 'bg-white/10 w-4'}`} />
                  ))}
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#E2FF6F]">
                  Step {currentStep + 1} of {activeModule.steps.length}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                    {activeModule.steps[currentStep].text}
                  </h2>
                  <p className="text-xl text-white/60 font-medium leading-relaxed">
                    {activeModule.steps[currentStep].sub}
                  </p>
                </motion.div>
              </AnimatePresence>

              <Button
                size="lg"
                onClick={nextStep}
                className="h-14 px-10 text-lg rounded-2xl bg-[#E2FF6F] text-black font-bold hover:bg-[#d4f056]"
              >
                {currentStep === activeModule.steps.length - 1 ? 'Complete' : 'Continue'}
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <>
            <div className="sticky top-0 z-50 bg-[#0A0C0B]/80 backdrop-blur-md border-b border-white/5 px-4 py-4">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition">
                    <ArrowLeft className="w-5 h-5 text-white/40" />
                  </Link>
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                  <h1 className="text-lg font-bold uppercase tracking-widest text-white">Emergency & Rescue</h1>
                </div>
                {locationStatus === 'denied' ? (
                  <button onClick={fetchLocation} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-white/40">
                    <span className="w-2 h-2 rounded-full bg-white/30" /> Enable GPS
                  </button>
                ) : locationStatus === 'pending' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Locating…
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Located
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 mt-2">
              <section className="space-y-4">
                <a href="tel:911" className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white p-6 rounded-3xl shadow-2xl border-2 border-rose-600/30 flex items-center justify-between active:scale-95 transition-all">
                  <div>
                    <div className="text-4xl font-black tracking-tighter text-rose-500">911</div>
                    <div className="text-white/40 mt-1 font-bold tracking-widest text-sm uppercase">Emergency Services</div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-rose-600/10 flex items-center justify-center">
                    <PhoneCall className="w-8 h-8 text-rose-500" />
                  </div>
                </a>

                <button onClick={openAlertModal} className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white p-6 rounded-3xl shadow-2xl border-2 border-[#25D366]/30 flex items-center justify-between active:scale-95 transition-all text-left">
                  <div>
                    <div className="text-3xl font-black tracking-tighter text-[#25D366]">TRUSTED ALERT</div>
                    <div className="text-white/40 mt-1 font-bold tracking-widest text-sm uppercase">Send SOS Message</div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                    <AlertOctagon className="w-8 h-8 text-[#25D366]" />
                  </div>
                </button>
                
                <button onClick={handleMapsDirect} className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white p-5 rounded-3xl shadow-lg border border-blue-600/30 flex items-center justify-between active:scale-95 transition-all text-left">
                  <div>
                    <div className="text-xl font-black tracking-tighter text-blue-400">NEAREST HOSPITAL</div>
                    <div className="text-white/30 mt-1 font-bold tracking-widest text-xs uppercase">Open Map</div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                </button>
              </section>

              <section className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#E2FF6F]" /> Rescue Sessions
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {rescueModules.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => startModule(m)}
                      className="glass-panel p-4 rounded-2xl text-left hover:border-white/20 transition-all border border-white/5"
                    >
                      <div className={`w-10 h-10 rounded-xl ${m.color.replace('text', 'bg')}/10 flex items-center justify-center mb-3`}>
                        <m.icon className={`w-5 h-5 ${m.color}`} />
                      </div>
                      <h3 className="font-bold text-white">{m.title}</h3>
                      <p className="text-xs text-white/40 mt-1">{m.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <details className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                  <summary className="p-5 font-bold text-white flex items-center gap-3 cursor-pointer">
                    <Wind className="w-5 h-5 text-cyan-400" /> 4-7-8 Breathing
                  </summary>
                  <div className="p-5 pt-0 border-t border-white/5 text-center">
                    <div className="relative w-40 h-40 mx-auto flex items-center justify-center my-6">
                      <motion.div 
                        className="absolute inset-0 border-2 border-white/10 rounded-full"
                        animate={{ scale: breathingPhase === 'inhale' || breathingPhase === 'hold' ? 1.3 : 1 }}
                      />
                      <motion.div 
                        className="absolute bg-cyan-500/20 rounded-full flex items-center justify-center"
                        animate={{ 
                           width: breathingPhase === 'inhale' || breathingPhase === 'hold' ? '100%' : '60%', 
                           height: breathingPhase === 'inhale' || breathingPhase === 'hold' ? '100%' : '60%', 
                        }}
                        transition={{ duration: breathingPhase === 'inhale' ? 4 : (breathingPhase === 'exhale' ? 8 : 1) }}
                      >
                        <div className="text-white font-black flex flex-col items-center">
                          <div className="text-sm text-white/40">{breathingPhase === 'idle' ? 'READY' : breathingPhase.toUpperCase()}</div>
                          {breathingPhase !== 'idle' && <span className="text-4xl font-mono">{timeLeft}</span>}
                        </div>
                      </motion.div>
                    </div>
                    <Button 
                      onClick={() => setIsBreathingActive(!isBreathingActive)}
                      className="w-full bg-cyan-500 text-black font-bold rounded-xl hover:bg-cyan-400"
                    >
                      {isBreathingActive ? 'Stop' : 'Start'}
                    </Button>
                  </div>
                </details>

                <div id="contacts-section" className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5" /> Support Network</h2>
                    {!isAddingContact && <Button onClick={() => setIsAddingContact(true)} size="sm" variant="outline" className="rounded-lg border-white/10 text-white/60 hover:bg-white/10"><Plus className="w-4 h-4" /></Button>}
                  </div>

                  {personalContacts.length === 0 && !isAddingContact && (
                     <div className="p-4 rounded-xl text-center text-sm text-white/30 border border-dashed border-white/10">
                       Add a contact to enable SOS Alert
                     </div>
                  )}

                  {personalContacts.map((contact, idx) => (
                     <div key={idx} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                        <div>
                           <div className="font-bold text-white">{contact.name}</div>
                           <div className="text-xs text-white/40">{contact.phone}</div>
                        </div>
                        <div className="flex gap-2">
                           <a href={`tel:${contact.phone}`} className="h-9 w-9 flex items-center justify-center bg-white/10 rounded-lg"><Phone className="w-4 h-4" /></a>
                           <button onClick={() => handleRemoveContact(idx)} className="px-2 text-white/30 text-xs hover:text-rose-400">Del</button>
                        </div>
                     </div>
                  ))}

                  {isAddingContact && (
                     <div className="p-4 rounded-xl space-y-3 border border-white/10">
                        <Input placeholder="Name" value={newContactName} onChange={e => setNewContactName(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                        <Input placeholder="Phone" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} type="tel" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
                        <div className="flex gap-2">
                           <Button onClick={handleAddContact} disabled={!newContactName || !newContactPhone} className="flex-1 bg-[#E2FF6F] text-black font-bold">Save</Button>
                           <Button onClick={() => setIsAddingContact(false)} variant="outline" className="flex-1 border-white/10 text-white/40">Cancel</Button>
                        </div>
                     </div>
                  )}
                </div>

                <details className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
                  <summary className="p-5 font-bold text-white flex items-center gap-3 cursor-pointer">
                    <ShieldAlert className="w-5 h-5 text-rose-400" /> Safety Plan
                  </summary>
                  <div className="p-5 pt-0 space-y-4 border-t border-white/5">
                     <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-white/40">Warning signs</label>
                       <Textarea value={safetyPlan.warningSigns} onChange={e => handleSafetyPlanChange('warningSigns', e.target.value)} onBlur={handleSafetyPlanBlur} placeholder="When I notice..." className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-white/40">Coping strategies</label>
                       <Textarea value={safetyPlan.copingStrategies} onChange={e => handleSafetyPlanChange('copingStrategies', e.target.value)} onBlur={handleSafetyPlanBlur} placeholder="Things that help..." className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20" />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs uppercase tracking-widest font-bold text-white/40">Reasons to live</label>
                       <Textarea value={safetyPlan.reasonsToLive} onChange={e => handleSafetyPlanChange('reasonsToLive', e.target.value)} onBlur={handleSafetyPlanBlur} placeholder="What matters..." className="bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20" />
                     </div>
                  </div>
                </details>
              </section>
            </div>

            <AnimatePresence>
               {isAlertModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setIsAlertModalOpen(false); setSelectedAlertContact(null); }} />
                     <motion.div initial={{ opacity: 0, scale: 0.95, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-sm bg-[#111] rounded-3xl shadow-2xl p-6 border border-white/10">
                        <button onClick={() => { setIsAlertModalOpen(false); setSelectedAlertContact(null); }} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                        <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-4"><Send className="w-7 h-7 text-[#25D366]" /></div>
                        <h3 className="text-xl font-bold text-white mb-1">Send SOS Alert</h3>
                        <p className="text-sm text-white/40 mb-5">Choose how to reach your contact.</p>
                        <div className="bg-white/5 text-white/40 text-xs p-4 rounded-xl mb-5 whitespace-pre-wrap">
                          <span className="text-rose-400 font-bold">🚨 EMERGENCY:</span> I need help.{'\n\n'}Location: {userLocationStr || 'Unavailable'}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => selectedAlertContact && sendAlert(selectedAlertContact, 'whatsapp')} disabled={!selectedAlertContact} className="py-4 font-bold bg-[#25D366] text-black rounded-2xl hover:bg-[#20bd5a] disabled:opacity-40">WhatsApp</button>
                          <button onClick={() => selectedAlertContact && sendAlert(selectedAlertContact, 'sms')} disabled={!selectedAlertContact} className="py-4 font-bold bg-white text-black rounded-2xl hover:bg-white/80 disabled:opacity-40">SMS</button>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}