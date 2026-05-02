"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  HeartPulse, 
  Search, 
  Star, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  X,
  CheckCircle2,
  Phone
} from "lucide-react";

const therapists = [
  { 
    id: "t1", 
    name: "Dr. Sarah Mitchell", 
    specialty: "CBT & Anxiety Specialist", 
    rating: 4.9, 
    reviews: 124, 
    availability: "Tomorrow, 2:00 PM",
    img: "👩‍⚕️",
    price: "$80/hr",
    tags: ["Anxiety", "Depression", "CBT"]
  },
  { 
    id: "t2", 
    name: "Dr. Robert Chen", 
    specialty: "Student Life & Burnout", 
    rating: 4.8, 
    reviews: 98, 
    availability: "Friday, 10:00 AM",
    img: "👨‍⚕️",
    price: "$95/hr",
    tags: ["Burnout", "Academic", "Grief"]
  },
  { 
    id: "t3", 
    name: "Maria Rodriguez, LCSW", 
    specialty: "Trauma & Relationships", 
    rating: 5.0, 
    reviews: 210, 
    availability: "next week",
    img: "👩‍⚕️",
    price: "$75/hr",
    tags: ["Trauma", "LGBTQ+", "Family"]
  },
];

export default function TherapistPage() {
  const [selected, setSelected] = useState<any | null>(null);
  const [booked, setBooked] = useState(false);

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-rose-400 mb-2">
            <HeartPulse className="w-6 h-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Professional Help</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Therapist Directory</h1>
          <p className="text-muted-foreground text-lg italic">Connect with licensed professionals specialized in student wellbeing.</p>
        </div>
        
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input 
             placeholder="Search by specialty, name..." 
             className="w-full pl-10 pr-4 h-12 rounded-2xl glass-panel bg-background/50 border-border focus:ring-2 focus:ring-rose-400 outline-none text-sm transition-all"
           />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="glass-panel p-8 bg-rose-400/5 border-rose-400/20 space-y-6">
              <h3 className="font-bold text-lg">Filter Specialists</h3>
              <div className="space-y-4">
                 {["Online Sessions", "In-person", "Sliding Scale", "Crisis Ready"].map(f => (
                   <label key={f} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-md border-2 border-border group-hover:border-rose-400 transition-colors" />
                      <span className="text-sm font-medium text-foreground/80">{f}</span>
                   </label>
                 ))}
              </div>
              <Button className="w-full bg-rose-400 hover:bg-rose-500 text-white">Apply Filters</Button>
           </div>
           
           <div className="glass-panel p-8 border-dashed border-2 border-border text-center space-y-4">
              <Phone className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="font-bold">Need Help Now?</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">24/7 Crisis Hotline</p>
              <Button variant="outline" size="sm" className="w-full">Call Now</Button>
           </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
           {therapists.map(t => (
             <motion.div 
               key={t.id} 
               whileHover={{ y: -5 }}
               className="glass-panel p-8 space-y-6 group hover:border-rose-400/30 transition-all cursor-pointer"
               onClick={() => setSelected(t)}
             >
                <div className="flex items-start justify-between">
                   <div className="text-5xl w-20 h-20 glass-panel flex items-center justify-center bg-rose-400/5">{t.img}</div>
                   <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" /> {t.rating}
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{t.reviews} reviews</p>
                   </div>
                </div>

                <div className="space-y-1">
                   <h3 className="text-xl font-bold group-hover:text-rose-400 transition-colors">{t.name}</h3>
                   <p className="text-sm text-primary font-medium">{t.specialty}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                   {t.tags.map(tag => (
                     <span key={tag} className="px-2 py-1 bg-secondary rounded-md text-[10px] font-bold uppercase text-muted-foreground">#{tag}</span>
                   ))}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Availability</span>
                      <span className="text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {t.availability}</span>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Session Flat Fee</span>
                      <p className="text-sm font-bold text-foreground">{t.price}</p>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="glass-panel p-10 w-full max-w-2xl relative shadow-2xl space-y-8"
             >
                <button onClick={() => { setSelected(null); setBooked(false); }} className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors"><X/></button>
                
                {!booked ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                       <div className="text-7xl w-32 h-32 glass-panel flex items-center justify-center bg-rose-400/5 shrink-0">{selected.img}</div>
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <h2 className="text-3xl font-bold">{selected.name}</h2>
                            <p className="text-lg text-rose-500 font-bold">{selected.specialty}</p>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            "I specialize in helping students navigate the complexities of university life, focusing on burnout prevention and anxiety management using evidence-based CBT techniques."
                          </p>
                          <div className="flex gap-4 justify-center md:justify-start">
                             <div className="flex items-center gap-2 text-xs font-bold uppercase"><MapPin className="w-4 h-4 text-primary" /> Online Session</div>
                             <div className="flex items-center gap-2 text-xs font-bold uppercase"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Expert</div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {["Mon 10am", "Tue 2pm", "Wed 11am", "Fri 4pm"].map(slot => (
                         <button key={slot} className="p-4 rounded-2xl glass-panel text-sm font-bold hover:bg-rose-400 hover:text-white hover:border-rose-400 transition-all">{slot}</button>
                       ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                       <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Session Cost</p>
                          <p className="text-2xl font-bold">{selected.price}</p>
                       </div>
                       <Button size="lg" className="px-12 bg-rose-500 text-white hover:bg-rose-600 rounded-2xl h-16" onClick={() => setBooked(true)}>Book Session</Button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center space-y-6">
                     <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                        <CheckCircle2 className="w-12 h-12" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-3xl font-bold">Session Requested!</h2>
                        <p className="text-muted-foreground">Dr. {selected.name.split(' ').pop()} will review your request and confirm via email within 2 hours.</p>
                     </div>
                     <Button variant="outline" className="h-14 px-8 rounded-2xl" onClick={() => { setSelected(null); setBooked(false); }}>Return to Directory</Button>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
