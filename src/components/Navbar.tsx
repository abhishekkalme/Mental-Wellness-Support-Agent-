"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-12 bg-transparent pointer-events-none"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 pointer-events-auto group">
        <div className="w-10 h-10 bg-[#E2FF6F] rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">MindCare</span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-10 pointer-events-auto">
        {[
          { name: "Home", id: "home" },
          { name: "Discover", id: "features" },
          { name: "How it Works", id: "workflow" },
          { name: "Testimonials", id: "feedback" },
          { name: "About Us", id: "footer" }
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

      {/* CTA */}
      <div className="pointer-events-auto flex items-center gap-3 flex-wrap justify-end">
        <Link href="/guest">
          <Button variant="ghost" className="text-white/80 hover:text-[#E2FF6F] hover:bg-white/5 font-bold text-sm">
            Try as guest
          </Button>
        </Link>
        <Link href="/signin">
          <Button variant="ghost" className="text-white hover:text-[#E2FF6F] hover:bg-white/5 font-bold">
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button 
            className="bg-[#E2FF6F] text-black hover:bg-[#d4f056] font-bold rounded-full px-8 h-12 gap-2 transition-all active:scale-95"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}
