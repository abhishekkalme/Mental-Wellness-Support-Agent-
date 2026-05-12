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
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

// --- Types ---
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

const DEFAULT_SAFETY_PLAN: SafetyPlan = {
  warningSigns: '',
  copingStrategies: '',
  reasonsToLive: '',
  safePlaces: '',
};

export default function CrisisPage() {
  const { data: session, status } = useSession();
  
  // DB State
  const [personalContacts, setPersonalContacts] = useState<PersonalContact[]>([]);
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>(DEFAULT_SAFETY_PLAN);
  
  const [dbLoading, setDbLoading] = useState(true);

  // UI State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  
  // Modals
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertContact, setSelectedAlertContact] = useState<PersonalContact | null>(null);

  // Location
  const [userLocationStr, setUserLocationStr] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  // Grounding State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

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

  // Initial Fetch
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

  // Breathing logic
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

  // Deep Links
  const handleMapsDirect = () => {
     if (locationCoords) {
       // Use exact GPS coordinates for precise hospital search
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
      alert('Please add a trusted contact below first.');
      document.getElementById('contacts-section')?.scrollIntoView({ behavior: 'smooth' });
      setIsAddingContact(true);
      return;
    }
    // Pre-select the first contact; user can choose another inside the modal
    setSelectedAlertContact(personalContacts[0]);
    setIsAlertModalOpen(true);
  };

  if (status === 'loading' || dbLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-slate-500 font-bold">Loading secure environment...</div>;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans pb-24 selection:bg-slate-800" role="main">
      
      {/* CRISIS HEADER */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b-2 border-slate-800/50 px-4 py-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition">
              <ArrowLeft className="w-6 h-6 text-slate-400 hover:text-white" />
            </Link>
            <ShieldAlert className="w-8 h-8 text-slate-500" />
            <h1 className="text-xl font-bold uppercase tracking-widest text-slate-100">Emergency Help</h1>
          </div>
          {/* Location status badge — clickable retry when denied */}
          {locationStatus === 'denied' ? (
            <button
              onClick={fetchLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-widest hover:border-amber-700 hover:text-amber-400 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              Tap to enable GPS
            </button>
          ) : locationStatus === 'pending' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900 text-amber-500 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Locating…
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-800/50 bg-emerald-950/50 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Located
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 mt-2">
        
        {/* ============================================================== */}
        {/* Tier 1: CRITICAL IMMEDIATE DISPATCH (Top of screen, Massive) */}
        {/* ============================================================== */}
        <section className="space-y-4">
           {/* CALL 911 */}
           <a 
              href="tel:911" 
              className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-rose-600/30 hover:border-rose-500 flex items-center justify-between active:scale-95 transition-all group"
            >
              <div>
                <div className="text-4xl sm:text-5xl font-black tracking-tighter text-rose-500">CALL 911</div>
                <div className="text-slate-400 mt-2 font-bold tracking-widest text-sm uppercase">Emergency Services</div>
              </div>
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-rose-600/10 flex items-center justify-center group-hover:bg-rose-600/20 transition-colors">
                 <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 group-hover:scale-110 transition-transform" />
              </div>
           </a>

           {/* TRUSTED ALERT - WHATSAPP STYLE GREEN */}
           <button 
              onClick={openAlertModal}
              className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-[#25D366]/30 hover:border-[#25D366] flex items-center justify-between active:scale-95 transition-all group text-left"
            >
              <div>
                <div className="text-3xl sm:text-4xl font-black tracking-tighter text-[#25D366]">TRUSTED ALERT</div>
                <div className="text-slate-400 mt-2 font-bold tracking-widest text-sm uppercase">Auto-Send SOS Message</div>
              </div>
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                 <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10 text-[#25D366] group-hover:scale-110 transition-transform" />
              </div>
           </button>
           
           {/* HOSPITALS FALLBACK - SAFE BLUE */}
           <button 
              onClick={handleMapsDirect}
              className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white p-5 rounded-3xl shadow-lg border border-blue-600/30 hover:border-blue-500 flex items-center justify-between active:scale-95 transition-all group text-left"
            >
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tighter text-blue-500">NEAREST HOSPITAL</div>
                <div className="text-slate-500 mt-1 font-bold tracking-widest text-xs uppercase">Open Map Directions</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                 <MapPin className="w-6 h-6 text-blue-500" />
              </div>
           </button>
        </section>

        {/* ============================================================== */}
        {/* Tier 2: STABILIZATION & RESOURCES (Card-based forms below fold) */}
        {/* ============================================================== */}
        <section className="space-y-4 pt-6">
           
           {/* GROUNDING EXERCISE ACCORDION */}
           <details className="bg-[#111] rounded-2xl border border-slate-800/60 group overflow-hidden transition-all duration-300">
               <summary className="p-6 font-bold text-lg text-slate-300 flex items-center gap-3 cursor-pointer select-none outline-none">
                 <Wind className="w-6 h-6 text-slate-500" /> Grounding Exercise
               </summary>
               <div className="p-6 pt-0 border-t border-slate-800 text-center">
                  <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-6">
                    <motion.div 
                      className="absolute inset-0 border-4 border-slate-700 rounded-full"
                      animate={{ scale: breathingPhase === 'inhale' || breathingPhase === 'hold' ? 1.3 : 1, opacity: breathingPhase === 'idle' ? 0 : 1 }}
                      transition={{ duration: breathingPhase === 'inhale' ? 4 : (breathingPhase === 'exhale' ? 8 : 1), ease: "linear" }}
                    />
                    <motion.div 
                      className="absolute bg-slate-800 rounded-full flex items-center justify-center shadow-lg"
                      animate={{ 
                         width: breathingPhase === 'inhale' || breathingPhase === 'hold' ? '100%' : '60%', 
                         height: breathingPhase === 'inhale' || breathingPhase === 'hold' ? '100%' : '60%', 
                         backgroundColor: breathingPhase === 'hold' ? '#334155' : (breathingPhase === 'exhale' ? '#475569' : '#1e293b') 
                      }}
                      transition={{ duration: breathingPhase === 'inhale' ? 4 : (breathingPhase === 'exhale' ? 8 : 1), ease: "linear" }}
                    >
                      <div className="text-white font-black tracking-widest flex flex-col items-center">
                        <div className="text-lg text-slate-400">{breathingPhase === 'idle' ? 'REST' : breathingPhase.toUpperCase()}</div>
                        {breathingPhase !== 'idle' && <span className="text-5xl mt-1 font-mono">{timeLeft}</span>}
                      </div>
                    </motion.div>
                  </div>
                  <Button 
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className="w-full sm:w-auto px-8 rounded-xl font-bold bg-white text-black border-none hover:bg-slate-300"
                  >
                    {isBreathingActive ? 'Stop Exercise' : 'Start 4-7-8 Breathing'}
                  </Button>
               </div>
           </details>

           {/* PERSONAL CONTACTS */}
           <div id="contacts-section" className="bg-[#111] p-6 rounded-2xl border border-slate-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-slate-300"><UserPlus className="w-5 h-5 text-slate-500" /> Support Network</h2>
                {!isAddingContact && <Button onClick={() => setIsAddingContact(true)} size="sm" variant="outline" className="rounded-lg font-bold bg-[#1a1a1a] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"><Plus className="w-4 h-4 mr-1"/> Add</Button>}
              </div>

              {personalContacts.length === 0 && !isAddingContact && (
                 <div className="bg-[#1a1a1a] p-4 rounded-xl text-center text-sm font-bold text-slate-500 border border-dashed border-slate-700">
                   Add a trusted contact to enable the SOS Alert.
                 </div>
              )}

              {personalContacts.map((contact, idx) => (
                 <div key={idx} className="bg-[#1a1a1a] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                       <div className="font-bold text-slate-200">{contact.name}</div>
                       <div className="text-xs font-bold text-slate-500 tracking-widest">{contact.phone}</div>
                    </div>
                    <div className="flex gap-2">
                       <a href={`tel:${contact.phone}`} className="h-10 w-10 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg active:scale-95 transition-colors"><Phone className="w-4 h-4" /></a>
                       <button onClick={() => handleRemoveContact(idx)} className="h-10 px-3 bg-transparent text-slate-500 font-bold text-xs hover:text-rose-500 transition-colors">Del</button>
                    </div>
                 </div>
              ))}

              {isAddingContact && (
                 <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-3 border border-slate-800">
                    <Input placeholder="Name" value={newContactName} onChange={e => setNewContactName(e.target.value)} className="bg-[#111] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700" />
                    <Input placeholder="Phone Number" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} type="tel" className="bg-[#111] border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700" />
                    <div className="flex gap-2">
                       <Button onClick={handleAddContact} disabled={!newContactName || !newContactPhone} className="flex-1 bg-white hover:bg-slate-200 text-black font-bold rounded-lg">Save</Button>
                       <Button onClick={() => setIsAddingContact(false)} variant="outline" className="flex-1 rounded-lg text-slate-400 border-slate-800 hover:bg-[#222] hover:text-white">Cancel</Button>
                    </div>
                 </div>
              )}
           </div>

           {/* SAFETY PLAN */}
           <details className="bg-[#111] rounded-2xl border border-slate-800/60 group overflow-hidden transition-all duration-300">
               <summary className="p-6 font-bold text-lg text-slate-300 flex items-center gap-3 cursor-pointer select-none outline-none">
                 <ShieldAlert className="w-6 h-6 text-slate-500" /> Safety Plan
               </summary>
               <div className="p-6 pt-0 space-y-5 border-t border-slate-800">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-slate-500">1. Warning signs</label>
                    <Textarea 
                      value={safetyPlan.warningSigns}
                      onChange={e => handleSafetyPlanChange('warningSigns', e.target.value)}
                      onBlur={handleSafetyPlanBlur}
                      placeholder="Recognizing when I'm escalating..."
                      className="bg-[#1a1a1a] border-slate-800 rounded-xl resize-none text-slate-300 placeholder:text-slate-700 focus-visible:ring-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-slate-500">2. Coping strategies</label>
                    <Textarea 
                      value={safetyPlan.copingStrategies}
                      onChange={e => handleSafetyPlanChange('copingStrategies', e.target.value)}
                      onBlur={handleSafetyPlanBlur}
                      placeholder="Things I know help calm me down..."
                      className="bg-[#1a1a1a] border-slate-800 rounded-xl resize-none text-slate-300 placeholder:text-slate-700 focus-visible:ring-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-slate-500">3. Reasons to live</label>
                    <Textarea 
                      value={safetyPlan.reasonsToLive}
                      onChange={e => handleSafetyPlanChange('reasonsToLive', e.target.value)}
                      onBlur={handleSafetyPlanBlur}
                      placeholder="Things that give me joy..."
                      className="bg-[#1a1a1a] border-slate-800 rounded-xl resize-none text-slate-300 placeholder:text-slate-700 focus-visible:ring-slate-700"
                    />
                  </div>
               </div>
           </details>
        </section>
      </div>

      {/* TRUSTED ALERT MODAL - Contact Picker + Dual Channel **/}
      <AnimatePresence>
         {isAlertModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }} 
                 className="absolute inset-0 bg-[#000]/80 backdrop-blur-sm" 
                 onClick={() => { setIsAlertModalOpen(false); setSelectedAlertContact(null); }}
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 100 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 100 }}
                 className="relative w-full max-w-sm bg-[#111] rounded-[2rem] shadow-2xl p-6 overflow-hidden border-2 border-slate-800"
               >
                  <button onClick={() => { setIsAlertModalOpen(false); setSelectedAlertContact(null); }} className="absolute top-4 right-4 p-2 bg-[#1a1a1a] hover:bg-[#222] rounded-full text-slate-400 transition-colors">
                     <X className="w-5 h-5"/>
                  </button>
                  
                  <div className="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-5">
                     <Send className="w-8 h-8 text-[#25D366]" />
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tight mb-1 text-white">Send SOS Alert</h3>
                  <p className="text-sm font-medium text-slate-500 mb-5">Choose a contact and how to reach them.</p>

                  {/* Contact Picker */}
                  {personalContacts.length > 1 && (
                    <div className="space-y-2 mb-5">
                      {personalContacts.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedAlertContact(c)}
                          className={`w-full text-left p-3 rounded-xl border transition-all ${
                            selectedAlertContact?.phone === c.phone
                              ? 'border-[#25D366] bg-[#25D366]/10 text-white'
                              : 'border-slate-800 bg-[#1a1a1a] text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <span className="font-bold text-sm block">{c.name}</span>
                          <span className="text-xs font-mono">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Preview */}
                  <div className="bg-[#1a1a1a] text-slate-400 text-xs p-4 rounded-xl border border-slate-800 mb-5 whitespace-pre-wrap font-mono leading-relaxed">
                    <span className="text-rose-400 font-bold">🚨 EMERGENCY ALERT:</span> I may need help right now.{'\n\n'}Location: {userLocationStr || 'Unavailable'}{'\n\n'}Please check in on me immediately.
                  </div>

                  {/* Dual Channel Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => selectedAlertContact && sendAlert(selectedAlertContact, 'whatsapp')}
                      disabled={!selectedAlertContact}
                      className="rounded-2xl py-4 font-black text-base bg-[#25D366] text-black hover:bg-[#20bd5a] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" /> WhatsApp
                    </button>
                    <button 
                      onClick={() => selectedAlertContact && sendAlert(selectedAlertContact, 'sms')}
                      disabled={!selectedAlertContact}
                      className="rounded-2xl py-4 font-black text-base bg-slate-200 text-black hover:bg-white active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      <Phone className="w-4 h-4" /> SMS
                    </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </main>
  );
}
