"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MoveDown, Plus, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FloatingTag = ({ label, delay }: { label: string; delay: number }) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay, duration: 0.8, ease: "easeOut" }}
    whileHover={{ x: -10, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
    className="flex items-center gap-3 px-6 py-4 border border-white/20 rounded-full backdrop-blur-md bg-white/5 cursor-pointer whitespace-nowrap group transition-colors"
  >
    <span className="text-white font-medium">{label}</span>
    <Plus className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-nunito selection:bg-[#E2FF6F] selection:text-black scroll-smooth">
      <Navbar />

      {/* Hero Content */}
      <main id="home" className="relative h-screen flex flex-col justify-center px-12 md:px-24">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/forest-bg.png"
            alt="Cinematic Forest"
            fill
            className="object-cover opacity-80 brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>

        {/* Text Items */}
        <div className="relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex items-start gap-8"
          >
             <div className="mt-8 hidden md:block">
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#E2FF6F]">
                    <path d="M20 20 L80 80 M80 30 L80 80 L30 80" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
             </div>

             <div className="space-y-[-10px] md:space-y-[-40px]">
                <motion.h1 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 1 }}
                  className="text-[60px] md:text-[200px] font-bold text-white leading-none tracking-tighter"
                >
                  wellness &
                </motion.h1>
                <motion.h1 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="text-[60px] md:text-[200px] font-bold text-white leading-none tracking-tighter"
                >
                  meditation
                </motion.h1>
             </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-white/60 text-lg md:text-2xl mt-12 max-w-xl leading-relaxed font-medium"
          >
            Take your time and productivity so you can see where you're spending your time and make adjustment as needed.
          </motion.p>
        </div>

        {/* Vertical Floating Tags */}
        <div className="absolute right-12 bottom-24 hidden lg:flex flex-col gap-4 z-20">
          <FloatingTag label="Health & Wellness" delay={1.0} />
          <FloatingTag label="Mind Freshness" delay={1.2} />
          <FloatingTag label="Meditation" delay={1.4} />
          <FloatingTag label="Daily Routine" delay={1.6} />
        </div>

        {/* Scroll Down */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: [0.3, 0.6, 0.3] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="absolute bottom-12 left-12 flex items-center gap-4 text-white/40 text-xs font-bold z-20"
        >
          <div className="w-[1px] h-12 bg-white/20 relative">
            <motion.div 
                animate={{ y: [0, 48, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-full h-4 bg-[#E2FF6F]"
            />
          </div>
          <span>(SCROLL DOWN)</span>
        </motion.div>
      </main>

      {/* Stats Section */}
      <section className="relative z-10 bg-black py-32 px-12 md:px-24 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {[
            { label: "Tranquil sessions", value: "10k+", color: "text-[#E2FF6F]" },
            { label: "Stress Reduction", value: "85%", color: "text-white" },
            { label: "Community Members", value: "50k", color: "text-[#E2FF6F]" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-2"
            >
              <h2 className={`text-6xl md:text-8xl font-bold tracking-tighter ${stat.color}`}>{stat.value}</h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-black pt-32 pb-48 px-12 md:px-24">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              Everything for your <br /> <span className="text-[#E2FF6F]">inner peace.</span>
            </h2>
            <p className="text-white/60 max-w-sm text-lg font-medium">
              We've built a multi-sensory platform designed to help you reconnect with your most grounded self.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI Companion", desc: "A sentient digital friend that listens and provides emotional guidance without judgment.", icon: "🤖" },
              { title: "Mood Analytics", desc: "Visualize your emotional journey with clean, high-fidelity data patterns.", icon: "📊" },
              { title: "Rescue Mode", desc: "Immediate grounding exercises for when panic or overwhelming anxiety strikes.", icon: "🛡️" },
              { title: "Sound Therapy", desc: "Binaural beats and nature landscapes specifically tuned for rejuvenation.", icon: "🎧" },
              { title: "Sleep Stories", desc: "Narrated journeys designed to lulls your conscious mind into deep rest.", icon: "🌙" },
              { title: "Progress Library", desc: "Archive your growth and celebrate small wins in your wellness journey.", icon: "📖" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-panel p-10 bg-white/5 border-white/10 hover:border-[#E2FF6F]/40 transition-all cursor-crosshair group"
              >
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{f.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="relative z-10 bg-black py-48 px-12 md:px-24 border-t border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E2FF6F]/5 blur-[200px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto space-y-32">
          <h2 className="text-6xl md:text-9xl font-bold text-white tracking-tighter text-center">
            The path is <br /> <span className="text-[#E2FF6F]">simple.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 hidden md:block -z-10" />
            {[
              { step: "01", title: "Reflect", desc: "Check in with your mood and log your thoughts in seconds." },
              { step: "02", title: "Practice", desc: "Engage in guided sessions tailored to your current energy." },
              { step: "03", title: "Evolve", desc: "See your patterns and build lasting mental resilience." },
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.3 }}
                className="space-y-6 text-center md:text-left"
              >
                <span className="text-[#E2FF6F] font-bold text-5xl tracking-tighter">{s.step}</span>
                <h3 className="text-3xl font-bold text-white">{s.title}</h3>
                <p className="text-white/40 leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="relative z-10 bg-black py-48 px-12 md:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
             <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter">Your peace is our <br /> <span className="text-[#E2FF6F]">mission.</span></h2>
             <p className="text-white/60 text-xl font-medium leading-relaxed">
               More than just an app, MindCare AI is a movement towards mental clarity in a chaotic world.
             </p>
             <div className="flex gap-4">
                <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-10 h-16 text-lg">Download App</Button>
                <div className="flex flex-col justify-center">
                   <div className="flex text-[#E2FF6F] font-bold text-lg">★★★★★</div>
                   <p className="text-white/40 text-xs font-bold uppercase tracking-widest">4.9/5 App Store Rating</p>
                </div>
             </div>
          </div>
          
          <div className="grid gap-6">
            {[
              { name: "Sophia R.", quote: "The AI companion actually feels like it understands me. It's the first thing I open when I'm stressed." },
              { name: "James L.", quote: "Clean UI, beautiful animations, and it actually helps. The rescue sessions are life-saving." },
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-10 bg-white/5 border-white/10"
              >
                <p className="text-white/80 text-lg italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E2FF6F]/20 flex items-center justify-center font-bold text-[#E2FF6F]">{t.name[0]}</div>
                  <span className="text-white font-bold tracking-tight">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="relative z-10 bg-black py-24 px-12 md:px-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
           <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E2FF6F] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">HealthMed</span>
              </div>
              <p className="text-white/30 text-sm max-w-xs leading-relaxed">
                Empowering individuals through AI-driven mental wellness. Built for the modern mind.
              </p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="space-y-4">
                <p className="text-white font-bold text-sm uppercase tracking-[0.2em]">Product</p>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/meditation" className="hover:text-white transition-colors">Meditation</Link></li>
                  <li><Link href="/sleep" className="hover:text-white transition-colors">Sleep</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-white font-bold text-sm uppercase tracking-[0.2em]">Company</p>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-white font-bold text-sm uppercase tracking-[0.2em]">Social</p>
                <ul className="space-y-2 text-white/40 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                </ul>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/20">
           <span>© 2026 MindCare AI. All rights reserved.</span>
           <span>Crafted for serenity.</span>
        </div>
      </footer>

      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
