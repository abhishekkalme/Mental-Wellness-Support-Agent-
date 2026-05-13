'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
} from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useStore } from '@/store/useStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 bg-black/50 backdrop-blur-md border-b border-white/5"
    >
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-[#E2FF6F] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">MindCare</span>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {[
          { name: 'Home', id: 'home' },
          { name: 'Discover', id: 'features' },
          { name: 'How it Works', id: 'workflow' },
          { name: 'Testimonials', id: 'feedback' },
        ].map((item) => (
          <a
            key={item.name}
            href={`#${item.id}`}
            onClick={(e) => scrollToSection(e, item.id)}
            className="text-white/70 hover:text-white font-medium transition-colors text-sm tracking-wide"
          >
            {item.name}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard">
              <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-5 h-9 text-sm gap-2 transition-all">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="text-white/60 hover:text-red-400 hover:bg-white/5 font-bold h-9 px-3"
              onClick={() => {
                useStore.getState().clearStore();
                useStore.getState().clearPersistedData();
                signOut({ callbackUrl: '/' });
              }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/signin">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/5 font-bold h-9 px-4"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-5 h-9 gap-2 transition-all active:scale-95 text-sm">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:text-[#E2FF6F] transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden md:hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {[
                { name: 'Home', id: 'home' },
                { name: 'Discover', id: 'features' },
                { name: 'How it Works', id: 'workflow' },
                { name: 'Testimonials', id: 'feedback' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className="text-xl font-bold text-white hover:text-[#E2FF6F] transition-colors py-2"
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold h-14 text-lg gap-2 rounded-2xl">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full text-white/60 border-white/10 h-14 text-lg font-bold rounded-2xl hover:bg-white/5"
                      onClick={() => {
                        setIsOpen(false);
                        useStore.getState().clearStore();
                        useStore.getState().clearPersistedData();
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/signin" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-white border-white/20 h-14 text-lg font-bold rounded-2xl hover:bg-white/5"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold h-14 text-lg gap-2 rounded-2xl">
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
