'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Sparkles, MessageSquare, BarChart3, Shield, Moon, BookOpen, Wind, Brain, Heart, Target, Activity, TrendingUp, LayoutDashboard, LogOut, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';

function FloatingTag({ label, href, delay, icon: Icon }: { label: string; href: string; delay: number; icon: any }) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        whileHover={{ x: -8, backgroundColor: 'rgba(226, 255, 111, 0.15)', borderColor: 'rgba(226, 255, 111, 0.3)' }}
        className="flex items-center gap-3 px-6 py-4 border border-white/10 rounded-full backdrop-blur-md bg-white/5 cursor-pointer whitespace-nowrap group transition-all"
      >
        <Icon className="w-4 h-4 text-[#E2FF6F] group-hover:scale-110 transition-transform" />
        <span className="text-white font-medium">{label}</span>
        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
      </motion.div>
    </Link>
  );
}

const HeroActions = () => {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.8 }}
      className="flex flex-col sm:flex-row gap-3 mt-8"
    >
      {isAuthenticated ? (
        <>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full h-14 px-8 text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#E2FF6F]/20">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
                useStore.getState().clearStore();
                useStore.getState().clearPersistedData();
                signOut({ callbackUrl: '/' });
              }}
            className="w-full sm:w-auto text-white/60 border-white/10 h-14 px-8 text-lg font-bold flex items-center justify-center gap-2 hover:bg-white/5 hover:text-red-400 rounded-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link href="/signup">
            <Button className="w-full sm:w-auto bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full h-14 px-10 text-lg flex items-center justify-center gap-2 shadow-xl shadow-[#E2FF6F]/20">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-white/70 border-white/20 h-14 px-8 text-lg font-bold flex items-center justify-center hover:bg-white/5 hover:text-white rounded-full"
            >
              Sign In
            </Button>
          </Link>
        </>
      )}
    </motion.div>
  );
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden selection:bg-[#E2FF6F] selection:text-black scroll-smooth">
      <Navbar />

      {/* Hero */}
      <main
        id="home"
        className="relative h-[100svh] flex flex-col justify-center px-6 md:px-24 min-h-[600px]"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/forest-bg.png"
            alt="Cinematic Forest"
            fill
            className="object-cover opacity-80 brightness-[0.7]"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        </div>

        <div className="relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="flex items-start gap-8"
          >
            <div className="mt-8 hidden md:block">
              <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#E2FF6F]">
                <path
                  d="M20 20 L80 80 M80 30 L80 80 L30 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="space-y-[-10px] md:space-y-[-40px]">
              <motion.h1
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="text-[36px] sm:text-[80px] md:text-[200px] font-bold text-white leading-none tracking-tighter"
              >
                wellness &
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="text-[36px] sm:text-[80px] md:text-[200px] font-bold text-white leading-none tracking-tighter"
              >
                meditation
              </motion.h1>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-white/60 text-lg md:text-2xl mt-12 max-w-xl leading-relaxed font-medium"
          >
            AI-powered wellness companion that understands you. Track your mood, build habits, and find peace — all in one place.
          </motion.p>

          <HeroActions />
        </div>

        <div className="absolute right-8 md:right-12 bottom-24 hidden lg:flex flex-col gap-4 z-20">
          <FloatingTag label="AI Companion Chat" href="/chat" delay={1.0} icon={MessageSquare} />
          <FloatingTag label="Mood Tracking" href="/mood" delay={1.2} icon={Activity} />
          <FloatingTag label="Breathing Exercises" href="/breathing" delay={1.4} icon={Wind} />
          <FloatingTag label="Sleep & Recovery" href="/sleep" delay={1.6} icon={Moon} />
        </div>

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

      {/* Stats */}
      <section className="relative z-10 bg-black py-16 md:py-32 px-6 md:px-12 lg:px-24 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {[
            { label: 'Active Sessions', value: '10k+', color: 'text-[#E2FF6F]' },
            { label: 'Stress Reduction', value: '85%', color: 'text-white' },
            { label: 'Community Members', value: '50k+', color: 'text-[#E2FF6F]' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-2 text-center md:text-left"
            >
              <h2 className={`text-6xl md:text-8xl font-bold tracking-tighter ${stat.color}`}>
                {stat.value}
              </h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 bg-black pt-16 md:pt-32 pb-24 md:pb-48 px-6 md:px-12 lg:px-24"
      >
        <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              Everything for your <br /> <span className="text-[#E2FF6F]">inner peace.</span>
            </h2>
            <p className="text-white/60 max-w-sm text-lg font-medium">
              We&apos;ve built a multi-sensory platform designed to help you reconnect with your most grounded self.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Companion',
                desc: 'A sentient digital friend that listens and provides emotional guidance without judgment.',
                icon: MessageSquare,
                color: 'text-[#E2FF6F]',
                bg: 'bg-[#E2FF6F]/10',
              },
              {
                title: 'Mood Analytics',
                desc: 'Visualize your emotional journey with clean, high-fidelity data patterns.',
                icon: BarChart3,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
              },
              {
                title: 'Rescue Mode',
                desc: 'Immediate grounding exercises for when panic or overwhelming anxiety strikes.',
                icon: Shield,
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
              },
              {
                title: 'Sound Therapy',
                desc: 'Binaural beats and nature landscapes specifically tuned for rejuvenation.',
                icon: Moon,
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
              },
              {
                title: 'Sleep Stories',
                desc: 'Narrated journeys designed to lull your conscious mind into deep rest.',
                icon: BookOpen,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
              {
                title: 'Habit Building',
                desc: 'Build lasting routines with smart habit tracking and streak accountability.',
                icon: Target,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass-panel p-8 md:p-10 bg-white/5 border-white/10 hover:border-[#E2FF6F]/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm md:text-base">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="workflow"
        className="relative z-10 bg-black py-24 md:py-48 px-6 md:px-24 border-t border-white/5 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E2FF6F]/5 blur-[200px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-24 md:space-y-32">
          <h2 className="text-5xl md:text-9xl font-bold text-white tracking-tighter text-center leading-none">
            The path is <br /> <span className="text-[#E2FF6F]">simple.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative">
            <div className="hidden md:block absolute top-1/2 left-[16.6%] right-[16.6%] h-[1px] bg-white/10 -z-10" />
            {[
              {
                step: '01',
                title: 'Reflect',
                desc: 'Check in with your mood and log your thoughts in seconds.',
                icon: Heart,
              },
              {
                step: '02',
                title: 'Practice',
                desc: 'Engage in guided sessions tailored to your current energy.',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Evolve',
                desc: 'See your patterns and build lasting mental resilience.',
                icon: TrendingUp,
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="space-y-6 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#E2FF6F]/10 flex items-center justify-center mx-auto">
                  <s.icon className="w-8 h-8 text-[#E2FF6F]" />
                </div>
                <span className="text-[#E2FF6F] font-bold text-5xl tracking-tighter block">{s.step}</span>
                <h3 className="text-3xl font-bold text-white">{s.title}</h3>
                <p className="text-white/40 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="feedback" className="relative z-10 bg-black py-24 md:py-48 px-6 md:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-none">
              Your peace is our <br /> <span className="text-[#E2FF6F]">mission.</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed">
              More than just an app, MindCare AI is a movement towards mental clarity in a chaotic world.
            </p>
            <div className="flex gap-6 items-center">
              <Link href="/signup">
                <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-8 h-14 text-base gap-2 shadow-lg shadow-[#E2FF6F]/20">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex flex-col">
                <div className="flex text-[#E2FF6F] font-bold text-lg">★★★★★</div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                  4.9/5 from 2k+ reviews
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {[
              {
                name: 'Sophia R.',
                quote: "The AI companion actually feels like it understands me. It's the first thing I open when I'm stressed.",
              },
              {
                name: 'James L.',
                quote: 'Clean UI, beautiful animations, and it actually helps. The rescue sessions are life-saving.',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-8 md:p-10 bg-white/5 border-white/10 rounded-2xl"
              >
                <div className="flex gap-1 text-[#E2FF6F] mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-white/70 text-lg italic leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E2FF6F]/20 flex items-center justify-center font-bold text-[#E2FF6F] text-sm">
                    {t.name[0]}
                  </div>
                  <span className="text-white font-bold tracking-tight">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 bg-black py-24 md:py-32 px-6 md:px-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E2FF6F]/10 blur-[200px] rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-none">
            Ready to find <br /> <span className="text-[#E2FF6F]">your calm?</span>
          </h2>
          <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto font-medium">
            Join thousands of others who&apos;ve transformed their mental wellness journey with AI-powered guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full h-14 px-10 text-lg gap-2 shadow-xl shadow-[#E2FF6F]/20">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="outline"
                className="text-white/70 border-white/20 h-14 px-8 text-lg font-bold rounded-full hover:bg-white/5 hover:text-white"
              >
                I already have an account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 bg-black py-16 md:py-24 px-6 md:px-12 lg:px-24 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E2FF6F] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">MindCare</span>
            </Link>
            <p className="text-white/30 text-sm max-w-xs leading-relaxed">
              Empowering individuals through AI-driven mental wellness. Built for the modern mind.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
            <div className="space-y-4">
              <p className="text-white font-bold text-sm uppercase tracking-[0.2em]">Product</p>
              <ul className="space-y-2 text-white/40 text-sm">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/breathing" className="hover:text-white transition-colors">Breathing</Link></li>
                <li><Link href="/sleep" className="hover:text-white transition-colors">Sleep</Link></li>
                <li><Link href="/habits" className="hover:text-white transition-colors">Habits</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-white font-bold text-sm uppercase tracking-[0.2em]">Company</p>
              <ul className="space-y-2 text-white/40 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-white font-bold text-sm uppercase tracking-[0.2em]">Social</p>
              <ul className="space-y-2 text-white/40 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">X / Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 md:mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/20">
          <span>&copy; 2026 MindCare AI. All rights reserved.</span>
          <span>Crafted for serenity.</span>
        </div>
      </footer>

      {/* Decorative Blur */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-[#E2FF6F]/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
