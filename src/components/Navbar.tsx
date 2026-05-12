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
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 md:px-12 bg-black/50 backdrop-blur-md border-b border-white/5 pointer-events-none"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 pointer-events-auto group">
        <div className="w-10 h-10 bg-[#E2FF6F] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">MindCare</span>
      </Link>

      {/* Nav Links - Desktop */}
      <div className="hidden md:flex items-center gap-10 pointer-events-auto">
        {[
          { name: 'Home', id: 'home' },
          { name: 'Discover', id: 'features' },
          { name: 'How it Works', id: 'workflow' },
          { name: 'Testimonials', id: 'feedback' },
          { name: 'About Us', id: 'footer' },
        ].map((item) => (
          <a
            key={item.name}
            href={`#${item.id}`}
            onClick={(e) => scrollToSection(e, item.id)}
            className="text-white/80 hover:text-white font-medium transition-colors text-sm"
          >
            {item.name}
          </a>
        ))}
      </div>

      {/* CTA & Toggle */}
      <div className="pointer-events-auto flex items-center gap-3">
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className="text-white hover:text-[#E2FF6F] hover:bg-white/5 font-bold"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            {/* <Link href="/profile">
              <Button
                variant="ghost"
                className="text-white hover:text-[#E2FF6F] hover:bg-white/5 font-bold"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link> */}
            {/* <Link href="/settings">
              <Button
                variant="ghost"
                className="text-white hover:text-[#E2FF6F] hover:bg-white/5 font-bold"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link> */}
            <Button
              variant="ghost"
              className="text-white hover:text-red-400 hover:bg-white/5 font-bold"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3">
            <Link href="/signin">
              <Button
                variant="ghost"
                className="text-white hover:text-[#E2FF6F] hover:bg-white/5 font-bold"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-6 h-10 gap-2 transition-all active:scale-95 text-sm">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:text-[#E2FF6F] transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden md:hidden pointer-events-auto"
          >
            <div className="flex flex-col p-6 gap-6">
              {[
                { name: 'Home', id: 'home' },
                { name: 'Discover', id: 'features' },
                { name: 'How it Works', id: 'workflow' },
                { name: 'Testimonials', id: 'feedback' },
                { name: 'About Us', id: 'footer' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    scrollToSection(e, item.id);
                    setIsOpen(false);
                  }}
                  className="text-xl font-bold text-white hover:text-[#E2FF6F] transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    {/* <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-white border-white/10 h-14 text-lg"
                      >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                      </Button>
                    </Link> */}
                    {/* <Link href="/profile" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-white border-white/10 h-14 text-lg"
                      >
                        <User className="w-5 h-5 mr-3" />
                        Profile
                      </Button>
                    </Link>
                    <Link href="/settings" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-white border-white/10 h-14 text-lg"
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Button>
                    </Link> */}
                    {/* <Button
                      variant="outline"
                      className="w-full text-red-400 border-red-400/30 h-14 text-lg"
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </Button> */}
                  </>
                ) : (
                  <>
                    {/* <Link href="/signin" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full text-white border-white/10 h-14 text-lg"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-[#E2FF6F] text-black h-14 text-lg font-bold">
                        Get Started
                      </Button>
                    </Link> */}
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
